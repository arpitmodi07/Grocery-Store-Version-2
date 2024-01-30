export default {
  template: `
    <div class="my-4">
      <h3 class="mb-3 text-primary" style="font-size: 30px">All Categories Details</h3>
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Category ID</th>
            <th scope="col">Name</th>
            <th scope="col">Approved</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(category, index) in category" :key="index">
            <td>{{ category.id }}</td>
            <td>{{ category.name }}</td>
            <td>{{ category.is_approved }}</td>
            <td>
              <button @click="approveCategory(category.id)" class="btn btn-success mr-5" v-if="!category.is_approved && role=='admin'">Approve</button>
              <button @click="edit_category(category.id)" class="btn btn-success mr-5" v-if="category.is_approved">Edit</button>
              <button @click="confirmRemoveCategory(category.id)" class="btn btn-danger" v-if="role=='admin'">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  props: ['category'], // Assuming your prop name is 'categories'
  data() {
    return {
      role: localStorage.getItem('role'),
      authToken: localStorage.getItem('auth-token'),
    };
  },
  methods: {
    async approveCategory(id) {
      const res = await fetch(`/category/approve/${id}`, {
        headers: {
          'Authentication-Token': this.authToken,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        this.$router.go(0); // Refresh the page
      } else {
        alert(data.message);
      }
    },
    async confirmRemoveCategory(id) {
      if (confirm("Do you want to delete the category and its related products?")) {
        await this.remove_category(id);
      }
    },
    async remove_category(id) {
      const res = await fetch(`/category/remove/${id}`, {
        headers: {
          'Authentication-Token': this.authToken,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        this.$router.go(0); // Refresh the page
      } else {
        alert(data.message);
      }
    },
    edit_category(id) {
      this.$router.push({ name: 'UpdateCategory', params: { id } });
    },
  },
};

