<template>
  <v-container fluid>
    <!-- App bar with back button -->
    <v-app-bar app color="white" flat>
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>Attendance</v-toolbar-title>
    </v-app-bar>

    
    <v-row class="align-center justify-space-between mb-4">
      <v-col cols="6">
        <h1 class="attendance-heading">Attendance</h1>
      </v-col>
      <v-col cols="6" class="text-right">
        <v-btn color="secondary" @click="goToReports">View Reports</v-btn>
      </v-col>
    </v-row>
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" class="text-center">
        <v-img :src="imagePath" height="120px" width="120px" class="mx-auto my-4 attendance-img" contain></v-img>
        <!-- Main check-in/out button now uses Web NFC API only -->
        <v-btn :color="checkInStatus ? 'success' : 'primary'" class="my-4" @click="handleCheckInOut">
          {{ checkInStatus ? 'Check Out' : 'Tap to Check In' }}
        </v-btn>
        <!-- Status feedback -->
        <v-switch
          v-model="checkInStatus"
          color="green"
          inset
          class="my-4"
          :label="checkInStatus ? 'Checked In' : 'Not Checked In'"
          disabled
        />
        <div class="status">
          <span v-if="checkInStatus">You are checked in</span>
          <span v-else>You are not checked in</span>
        </div>
        <!-- Snackbar for user feedback -->
        <v-snackbar v-model="snackbar" :timeout="2000">{{ snackbarText }}</v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AttendanceView',
  data() {
    return {
      imagePath: '/images/NFC.png',
      checkInStatus: false, // Local state for check-in/out
      snackbar: false, // Controls feedback snackbar
      snackbarText: '', // Feedback message
    };
  },
  methods: {
    // Use Web NFC API for real NFC tap and toggle check-in/out
    async handleCheckInOut() {
      const apiUrl = import.meta.env.VITE_API_URL;
      // --- SIMULATION BLOCK START ---
      /*
      // The following block simulates an NFC scan for desktop testing
      const token = this.$store.state.user.token;
      const hallName = 'Mbarika Hall'; // TODO: Replace with a real hall name from your DB

      // Simulate resolve-class
      const response = await fetch(`${apiUrl}/resolve-class`, {
        method: 'POST',
        headers:
         {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hallName }),
      });
      const data = await response.json();
      if (response.ok && data.courseId) {
        // Simulate attendance
        const attendanceRes = await fetch(`${apiUrl}/nfc/attendance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: data.courseId }),
        });
        const attendanceData = await attendanceRes.json();
        if (attendanceRes.ok) {
          this.checkInStatus = !this.checkInStatus;
          this.snackbarText = attendanceData.message || 'Attendance marked!';
        } else {
          this.snackbarText = attendanceData.error || 'Attendance failed!';
        }
        this.snackbar = true;
      } else {
        this.snackbarText = data.error || 'No class at this time!';
        this.snackbar = true;
      }
      // --- SIMULATION BLOCK END ---
      */

      // --- REAL NFC CODE FOR MOBILE ---
      if (!('NDEFReader' in window)) {
        this.snackbarText = 'Web NFC is not supported on this device/browser.';
        this.snackbar = true;
        return;
      }
      try {
        const ndef = new window.NDEFReader();
        await ndef.scan();
        this.snackbarText = 'Ready to scan NFC tag. Tap your NFC tag now!';
        this.snackbar = true;
        ndef.onreading = async (event) => {
          let hallName = null;
          // Find the first text record in the NFC message
          for (const record of event.message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              hallName = textDecoder.decode(record.data);
              break;
            }
          }
          console.log('[NFC] Raw hallName from tag:', hallName);
          if (!hallName) {
            this.snackbarText = 'NFC tag does not contain a valid hall name.';
            this.snackbar = true;
            return;
          }
          const token = this.$store.state.user.token;
          try {
            const response = await fetch(`${apiUrl}/resolve-class`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ hallName }),
            });
            const data = await response.json();
            if (response.ok && data.courseId) {
              const attendanceRes = await fetch(`${apiUrl}/nfc/attendance`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courseId: data.courseId, hallName }), // Send both courseId and hallName
              });
              const attendanceData = await attendanceRes.json();
              if (attendanceRes.ok) {
                this.checkInStatus = !this.checkInStatus;
                this.snackbarText = attendanceData.message || 'Attendance marked!';
              } else {
                this.snackbarText = attendanceData.error || 'Attendance failed!';
              }
              this.snackbar = true;
            } else {
              this.snackbarText = data.error || 'No class at this time!';
              this.snackbar = true;
            }
          } catch (error) {
            this.snackbarText = error.message || 'Failed to resolve class.';
            this.snackbar = true;
          }
        }
      } catch (error) {
        this.snackbarText = error.message || 'NFC scan failed.';
        this.snackbar = true;
      }
      // --- END REAL NFC CODE ---
    },
    // Simulates an NFC tap for testing (calls backend to mark attendance)
    async simulateNfcTap() {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = this.$store.state.user.token;
      if (!token) {
        this.snackbarText = 'You must be logged in as a student to simulate NFC attendance.';
        this.snackbar = true;
        return;
      }
      try {
        // For demo, use a hardcoded courseId (replace with dynamic if needed)
        const payload = { courseId: 1 }; // TODO: Replace 1 with actual courseId from UI or NFC tag
        const response = await fetch(`${apiUrl}/nfc/attendance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok) {
          // Toggle check-in/out state for UI
          this.checkInStatus = !this.checkInStatus;
          this.snackbarText = data.message || 'Simulated NFC tap: Success!';
        } else {
          this.snackbarText = data.error || 'Simulated NFC tap: Failed!';
        }
        this.snackbar = true;
      } catch (err) {
        this.snackbarText = 'Simulated NFC tap: Network error.';
        this.snackbar = true;
      }
    },
    // Integrate Web NFC API for real NFC tag reading and use the content as the hall name
    async readNfcTag() {
      // Check if Web NFC is available
      if (!('NDEFReader' in window)) {
        this.snackbarText = 'Web NFC is not supported on this device/browser.';
        this.snackbar = true;
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const ndef = new window.NDEFReader();
        await ndef.scan();
        this.snackbarText = 'Ready to scan NFC tag. Tap your NFC tag now!';
        this.snackbar = true;
        ndef.onreading = async (event) => {
          // Only handle NFC taps from users (not system or browser default)
          if (!event.serialNumber && !event.message) {
            this.snackbarText = 'Invalid NFC tap.';
            this.snackbar = true;
            return;
          }
          // Extract hall name from NFC tag (assume text record contains hall name)
          let hallName = null;
          for (const record of event.message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              hallName = textDecoder.decode(record.data).trim();
              // Log the raw NFC value
              console.log('[NFC] Raw hallName from tag:', hallName);
              // Normalize: trim and lowercase for comparison
              hallName = hallName.trim();
              console.log('[NFC] Normalized hallName:', hallName);
            }
          }
          if (!hallName) {
            this.snackbarText = 'NFC tag does not contain a valid hall name.';
            this.snackbar = true;
            return;
          }
          // Use the hall name to determine the current class (call backend to resolve class)
          const token = this.$store.state.user.token;
          try {
            // Call backend to resolve which class is happening in this hall right now
            const response = await fetch(`${apiUrl}/resolve-class`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ hallName }),
            });
            const data = await response.json();
            if (response.ok && data.courseId) {
              // Mark attendance for the
              const attendanceRes = await fetch(`${apiUrl}/nfc/attendance`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courseId: data.courseId }),
              });
              const attendanceData = await attendanceRes.json();
              if (attendanceRes.ok) {
                this.checkInStatus = !this.checkInStatus;
                this.snackbarText = attendanceData.message || 'Attendance marked!';
              } else {
                this.snackbarText = attendanceData.error || 'Attendance failed!';
              }
            } else {
              this.snackbarText = data.error || 'No class found for this hall right now.';
            }
            this.snackbar = true;
          } 
          catch (err) {
            this.snackbarText = 'NFC attendance: Network error. ' + err.message;
            console.error('Network error details:', err);
            this.snackbar = true;
          }
        };
      } catch (err) {
        this.snackbarText = 'NFC scan failed: ' + err;
        this.snackbar = true;
      }
    },
    goToReports() {
      this.$router.push('/reports');
    },
  },
};
</script>

<style scoped>
.attendance-heading {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0;
}
.attendance-img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.status {
  margin: 20px 0;
  font-size: 16px;
}
.text-right {
  text-align: right !important;
}
</style>