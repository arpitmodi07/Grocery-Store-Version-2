export default{
    template:` <div>
    <div v-for="(category, index) in categoriesWithProducts" :key="index">
      <div class="container">
        <h2 class="text-center" style="color: #3498db;">{{ category.name }}</h2>
        <div class="row">
          <div v-for="(product, proindex) in product" :key="proindex" v-if="product.category_id === category.id" class="col-md-3" style="margin-bottom: 20px;">
            <div class="card product-card">
              <div class="card-body  text-center">
                <h5 class="card-title ">{{ product.name }}</h5>
                <div v-if="product.discount" class="card-discount">Discount:{{ product.discount }}%</div>
                <p class="card-text">Price: {{ product.price }}{{ product.unit }}</p>
                <p>Manufacturing Date: <b>{{product.manufacturing}}</b></p>
                <div v-if="role === 'cust'" class="d-flex justify-content-between">
                  <button class="btn btn-primary" @click="redirectToProductDetails(product.id)">Desc</button>

                  <div v-if="product.stock > 0">
                    <button class="btn btn-success" @click="add_to_cart(product.id)">Add to Cart</button>
                  </div>
                  <div v-else>
                    <p class="text-danger">Out of stock</p>
                  </div>
                </div>

                <div v-if="role === 'mang'">
                  <b>Stock: {{ product.stock }}</b><br>
                  <button class="btn btn-success" @click="update_product(product.id)">Edit Product</button>
                  <button class="btn btn-danger" @click="confirmRemoveproduct(product.id)">Delete Product</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  
    props:['product','category'],
    data(){
        return{
          details:{
            user_id:localStorage.getItem('id')
          },
            
          authToken:localStorage.getItem('auth-token'),
          role:localStorage.getItem('role'),
         
        }
    },
    computed: {
      categoriesWithProducts() {
        // Filter out categories with no associated products
        return this.category.filter((category) => {
          return this.product.some((product) => product.category_id === category.id);
        });
      },
    },
    methods: {
      redirectToProductDetails(id) {
        this.$router.push({ name: "ProductDetails", params: { id } });
      },
      update_product(id){
        this.$router.push({ name: "UpdateProduct", params: { id } });
      },
      
      async confirmRemoveproduct(id){
        if (confirm("Do you want to remove this product ?")) {
          await this.delete_product(id);
        }
      },

      async delete_product(id){
        const res = await fetch(`/remove/product/${id}`, {
          headers: {
            'Authentication-Token': this.authToken,
            
          },
          
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          this.$router.go(0)
        } else {
          alert(data.message);
        }
      },

      async add_to_cart(id){
        console.log("ID is",this.details.user_id)
        const res = await fetch(`/addcart/${id}`, {
          method:'POST',
          headers: {
            'Authentication-Token': this.authToken,
            'Content-Type':'application/json',
          },
          body: JSON.stringify(this.details),
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          this.$router.push('/')
        } else {
          alert(data.message);
        }
      }
    },

    
    
}

