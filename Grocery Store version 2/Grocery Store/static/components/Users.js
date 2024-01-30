export default {
    template: `<div class="container mt-3">
      <h2>All Managers Details</h2>
    
      <div v-if="error" class="alert alert-danger">
        Error code is {{error}}
      </div>
    
      <div v-for="(user, index) in allUsers" :key="index" class="card my-3">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <h5 class="card-title">Username:</h5>
              <b><p class="card-text">{{ user.username }}</p></b>
            </div>
            <div class="col-md-4">
              <h5 class="card-title">Email:</h5>
              <p class="card-text">{{ user.email }}</p>
            </div>
            <div class="col-md-4 text-md-right">
              <div v-if="user.active" class="alert alert-success">
                Manager has already been approved
              </div>
              
              <div v-else>
                <button class="btn btn-primary" @click="confirmApproveManager(user.id)">
                  Approve Manager
                </button>
                <button class="btn btn-danger" @click="confirmRemoveManager(user.id)">
                  Remove Manager
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`,
    data() {
      return {
        allUsers: [],
        token: localStorage.getItem("auth-token"),
        error: null,
      };
    },
    methods: {
      async confirmApproveManager(mangId) {
        if (confirm("Do you want to approve this manager?")) {
          await this.approve_manager(mangId);
        }
      },
      async confirmRemoveManager(mangId) {
        if (window.confirm("Do you want to remove this manager?")) {
          await this.remove_manager(mangId);
        }
      },
      async approve_manager(mangId) {
        const res = await fetch(`/activate/mang/${mangId}`, {
          headers: {
            'Authentication-Token': this.token
          }
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          this.$router.go(0);
        } else {
          alert(data.message);
        }
      },
      async remove_manager(mangId) {
        const res = await fetch(`/remove/mang/${mangId}`, {
          headers: {
            'Authentication-Token': this.token
          }
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          this.$router.go(0)
        } else {
          alert(data.message);
        }
      }
    },
    async mounted() {
      const res = await fetch('/users', {
        headers: {
          "Authentication-token": this.token
        },
      });
      const data = await res.json().catch((e) => {})
      if (res.ok) {
        this.allUsers = data;
      } else {
        this.error = res.status;
      }
    }
  };
  