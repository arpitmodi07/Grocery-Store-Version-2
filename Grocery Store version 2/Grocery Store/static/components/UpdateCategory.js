export default {
    template: `<div class="container mt-4 text-center">
      <h2 class="mb-4 text-primary">Edit a category</h2>
      <div class="form-group">
        <input type="text" class="form-control form-control-md mb-3" placeholder="Enter Category name" v-model="details.name" />
        <button @click="update_category" class="btn btn-success">Submit</button>
      </div>
    </div>`,
    data() {
      return {
        details: {
          name: null,
          id: this.$route.params.id,
        },
        token: localStorage.getItem('auth-token'),
        role: localStorage.getItem('role'),
      };
    },
    methods: {
      async update_category() {
        const res = await fetch(`/update/category/${this.details.id}`, {
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.details),
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          this.$router.push('/');
        } else {
          alert(data.message);
        }
      },
    },
  };
  