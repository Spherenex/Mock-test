import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Service to handle WebRTC streaming between test-takers and admin
 * Uses the existing Firebase configuration
 */
class RTCStreamingService {
  constructor() {
    this.db = db; // Use the existing Firestore instance
    this.peerConnections = {};
    this.localStream = null;
    this.isAdmin = false;
    this.activeStreams = {};
    this.onStreamCallback = null;
    this.mockMode = false;
    
    // Check if we need to use mock mode
    try {
      if (!this.db) {
        console.log('Firebase DB not available, using mock mode');
        this.mockMode = true;
      }
    } catch (error) {
      console.error('Error checking Firebase:', error);
      this.mockMode = true;
    }
  }

  /**
   * Initialize the service
   * @returns {boolean} Success status
   */
  initialize() {
    try {
      // Check if Firebase is available
      if (this.db) {
        console.log('RTCStreamingService initialized with Firebase');
        return true;
      } else {
        console.log('RTCStreamingService initialized in mock mode');
        this.mockMode = true;
        return true;
      }
    } catch (error) {
      console.error('Failed to initialize RTCStreamingService:', error);
      this.mockMode = true;
      return true;
    }
  }

  /**
   * Initialize as test-taker (student)
   * @param {MediaStream} stream - Camera/microphone stream from getUserMedia
   * @param {string} userId - User ID for the student
   * @param {string} testId - Current test session ID
   */
  initializeAsStudent(stream, userId, testId) {
    // Store basic information
    this.localStream = stream;
    this.userId = userId;
    this.testId = testId;
    this.isAdmin = false;

    // If in mock mode, don't try to use Firebase
    if (this.mockMode) {
      console.log('Student initialized in mock mode');
      return true;
    }

    try {
      // Store reference to active test in Firestore
      const activeTestRef = doc(this.db, 'activeTests', userId);
      setDoc(activeTestRef, {
        userId,
        testId,
        active: true,
        startTime: new Date().toISOString(),
        tabViolations: 0,
        noiseViolations: 0
      });

      // Listen for admin connection requests
      this.listenForConnectionRequests();

      // Cleanup function to be called when test ends
      window.addEventListener('beforeunload', () => this.cleanupStudentConnection());
      
      console.log('Initialized as student, ready for admin connections');
      return true;
    } catch (error) {
      console.error('Error initializing as student:', error);
      // Still return true to avoid breaking the UI
      return true;
    }
  }

  /**
   * Initialize as admin to monitor students
   * @param {Function} onStreamCallback - Called when new student stream is available
   */
  initializeAsAdmin(onStreamCallback) {
    this.isAdmin = true;
    this.onStreamCallback = onStreamCallback;
    
    // If in mock mode, create some test data
    if (this.mockMode) {
      console.log('Admin initialized in mock mode');
      
      // For testing, simulate some active users
      setTimeout(() => {
        if (this.onStreamCallback) {
          // First mock user
          this.onStreamCallback({
            type: 'add',
            userId: 'student1@example.com',
            data: {
              studentId: 'student1@example.com',
              violations: { tab: 1, noise: 0 },
              connected: true
            }
          });
          
          // Second mock user
          setTimeout(() => {
            this.onStreamCallback({
              type: 'add',
              userId: 'student2@example.com',
              data: {
                studentId: 'student2@example.com',
                violations: { tab: 0, noise: 2 },
                connected: true
              }
            });
          }, 1500);
        }
      }, 1000);
      
      return true;
    }

    try {
      // Listen for active tests
      const activeTestsRef = collection(this.db, 'activeTests');
      this.unsubscribeActiveTests = onSnapshot(activeTestsRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          const userId = change.doc.id;

          if (change.type === 'added') {
            console.log('New student active:', userId);
            this.connectToStudent(userId, data.testId);
          }
          
          if (change.type === 'modified') {
            // Update violation counts etc.
            if (this.activeStreams[userId]) {
              this.activeStreams[userId].violations = {
                tab: data.tabViolations || 0,
                noise: data.noiseViolations || 0
              };
              
              // Call callback to update UI
              if (this.onStreamCallback) {
                this.onStreamCallback({
                  type: 'update',
                  userId,
                  data: this.activeStreams[userId]
                });
              }
            }
          }
          
          if (change.type === 'removed') {
            console.log('Student disconnected:', userId);
            this.disconnectFromStudent(userId);
          }
        });
      });
      
      console.log('Initialized as admin, listening for student connections');
      return true;
    } catch (error) {
      console.error('Error initializing as admin:', error);
      // Fall back to mock mode
      this.mockMode = true;
      return this.initializeAsAdmin(onStreamCallback);
    }
  }

  /**
   * Connect to a student as admin
   */
  async connectToStudent(studentId, testId) {
    // Create peer connection for this student
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    this.peerConnections[studentId] = pc;
    
    // Set up event handlers
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ice candidate to student
        const iceCandidatesRef = doc(
          collection(this.db, 'activeTests', studentId, 'iceCandidates'), 
          Date.now().toString()
        );
        setDoc(iceCandidatesRef, event.candidate.toJSON());
      }
    };
    
    pc.ontrack = (event) => {
      console.log('Received track from student:', studentId);
      const stream = event.streams[0];
      
      // Store stream info
      this.activeStreams[studentId] = {
        stream,
        studentId,
        testId,
        violations: { tab: 0, noise: 0 },
        connected: true
      };
      
      // Notify callback
      if (this.onStreamCallback) {
        this.onStreamCallback({
          type: 'add',
          userId: studentId,
          data: this.activeStreams[studentId]
        });
      }
    };
    
    // Create offer
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Send offer to student
      const offerRef = doc(this.db, 'activeTests', studentId, 'offers', 'admin');
      await setDoc(offerRef, {
        sdp: pc.localDescription.sdp,
        type: pc.localDescription.type,
        timestamp: Date.now()
      });
      
      // Listen for answer
      const answerRef = doc(this.db, 'activeTests', studentId, 'answers', 'admin');
      this.unsubAnswers = onSnapshot(answerRef, async (snapshot) => {
        if (snapshot.exists() && snapshot.data()) {
          const data = snapshot.data();
          await pc.setRemoteDescription(new RTCSessionDescription(data));
        }
      });
      
      // Listen for ICE candidates from student
      const iceCandidatesRef = collection(this.db, 'activeTests', studentId, 'studentCandidates');
      this.unsubIceCandidates = onSnapshot(iceCandidatesRef, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            await pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
      
    } catch (error) {
      console.error('Error connecting to student:', error);
    }
  }
  
  /**
   * Listen for connection requests from admin (student side)
   */
  listenForConnectionRequests() {
    if (!this.userId) return;
    
    // Listen for offers from admin
    const offersRef = collection(this.db, 'activeTests', this.userId, 'offers');
    this.unsubOffers = onSnapshot(offersRef, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const adminId = change.doc.id;
          
          await this.answerConnectionRequest(adminId, data);
        }
      });
    });
  }
  
  /**
   * Answer connection request from admin (student side)
   */
  async answerConnectionRequest(adminId, offerData) {
    // Create peer connection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    this.peerConnections[adminId] = pc;
    
    // Add local tracks to connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }
    
    // Set up ice candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ice candidate to admin
        const iceCandidatesRef = doc(
          collection(this.db, 'activeTests', this.userId, 'studentCandidates'), 
          Date.now().toString()
        );
        setDoc(iceCandidatesRef, event.candidate.toJSON());
      }
    };
    
    // Set remote description (the offer)
    await pc.setRemoteDescription(new RTCSessionDescription(offerData));
    
    // Create answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    // Send answer to admin
    const answerRef = doc(this.db, 'activeTests', this.userId, 'answers', adminId);
    await setDoc(answerRef, {
      sdp: pc.localDescription.sdp,
      type: pc.localDescription.type,
      timestamp: Date.now()
    });
    
    // Listen for ICE candidates from admin
    const iceCandidatesRef = collection(this.db, 'activeTests', this.userId, 'iceCandidates');
    this.unsubIceCandidates = onSnapshot(iceCandidatesRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          await pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }

  /**
   * Update violation count (student side)
   */
  async updateViolationCount(type, count) {
    if (!this.userId || this.mockMode) {
      // In mock mode, just log
      console.log(`Mock update violation: ${type} count = ${count}`);
      return;
    }
    
    try {
      const activeTestRef = doc(this.db, 'activeTests', this.userId);
      
      if (type === 'tab') {
        await updateDoc(activeTestRef, { tabViolations: count });
      } else if (type === 'noise') {
        await updateDoc(activeTestRef, { noiseViolations: count });
      }
    } catch (error) {
      console.error('Error updating violation count:', error);
    }
  }

  /**
   * Terminate a student's test (admin side)
   */
  async terminateStudentTest(studentId, reason) {
    if (!this.isAdmin || this.mockMode) {
      console.log(`Mock terminate student: ${studentId}, reason: ${reason}`);
      
      // For mock mode, update the UI immediately
      if (this.onStreamCallback) {
        this.onStreamCallback({
          type: 'remove',
          userId: studentId
        });
      }
      
      return;
    }
    
    try {
      const activeTestRef = doc(this.db, 'activeTests', studentId);
      await updateDoc(activeTestRef, { 
        terminated: true,
        terminationReason: reason,
        terminationTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error terminating student test:', error);
    }
  }

  /**
   * Disconnect from a student (admin side)
   */
  disconnectFromStudent(studentId) {
    // Close peer connection
    if (this.peerConnections[studentId]) {
      this.peerConnections[studentId].close();
      delete this.peerConnections[studentId];
    }
    
    // Remove from active streams
    if (this.activeStreams[studentId]) {
      // Notify callback
      if (this.onStreamCallback) {
        this.onStreamCallback({
          type: 'remove',
          userId: studentId
        });
      }
      
      delete this.activeStreams[studentId];
    }
  }

  /**
   * Cleanup all connections (student side)
   */
  async cleanupStudentConnection() {
    if (!this.userId) return;
    
    // Remove active test entry
    try {
      const activeTestRef = doc(this.db, 'activeTests', this.userId);
      await deleteDoc(activeTestRef);
    } catch (error) {
      console.error('Error removing active test:', error);
    }
    
    // Close all peer connections
    Object.values(this.peerConnections).forEach(pc => pc.close());
    this.peerConnections = {};
    
    // Unsubscribe from listeners
    if (this.unsubOffers) this.unsubOffers();
    if (this.unsubIceCandidates) this.unsubIceCandidates();
  }

  /**
   * Cleanup all connections (admin side)
   */
  cleanupAdminConnections() {
    if (!this.isAdmin) return;
    
    // Close all peer connections
    Object.values(this.peerConnections).forEach(pc => pc.close());
    this.peerConnections = {};
    
    // Unsubscribe from listeners
    if (this.unsubscribeActiveTests) this.unsubscribeActiveTests();
    
    // Clear active streams
    this.activeStreams = {};
  }
}

// Create singleton instance
const rtcService = new RTCStreamingService();
export default rtcService;