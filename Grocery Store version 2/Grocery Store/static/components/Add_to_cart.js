export default {
    template: `
      <div>
      <div v-if="details.products.length === 0">
        <h3 style="color: navy;">Yupp!! Your Cart is empty<br><br>
        Want to shop now?? Click on continue shopping button below...
        </h3>
        
      </div>
        <div v-else class="row">
          <div class="col-md-12">
            <table class="table table-sm">
              <thead>
                <th>Sr</th>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Discount</th>
                <th>Subtotal</th>
                <th>Update</th>
                <th>Remove</th>
              </thead>
              <tbody>
                <tr v-for="(product, index) in details.products" :key="index">
                  
                  <td>{{ index + 1 }}</td>
                   
                  <td>{{ product.name }}</td>
                  <td>{{ product.price }}</td>
                  <td>
                    <input
                      type="number"
                      name="quantity"
                      v-model="product.quantity"
                      :min="1"
                      :max="product.stock"
                    />
                  </td>
                  
                  <td>{{ product.price * product.quantity }}</td>
                  <td>{{ product.discount }}%</td>
                  <td>{{ calculateSubtotal(product) }}</td>
                  <td>
                    <button @click="updateProduct(product.id)" class="btn btn-success">Update</button>
                  </td>
                  <td>
                    <button @click="removeProduct(product.id)" class="btn btn-danger">Remove</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div>
            <strong>Grand Total: {{ totalSubtotal }}</strong>
          </div>
          <button class="btn btn-primary" @click="order_now()">Order Now</button>
          <button class="btn btn-danger" @click="clear_cart()">Clear Cart </button>
          <br>
          </div>
        </div><br>
        <button class="btn btn-success" @click="continue_shop()">Continue Shopping</button> 
      </div>
    `,
    data() {
      return {
        details:{
            user_id: localStorage.getItem('id'),
            products: [],
            grand_total:null,
        },
        
       
        
      };
    },
    mounted() {
      this.fetchShoppingCart();
    },
    computed: {
        availableStock() {
          return product => product.stock - product.quantity;
        },
        totalSubtotal() {
          this.details.grand_total = this.details.products.reduce((sum, product) => sum + this.calculateSubtotal(product), 0);
          return this.details.grand_total;
        },
      },
   
    methods: {
      async fetchShoppingCart() {
        try {
          const response = await fetch(`/shopping-cart/${this.details.user_id}`);
          const data = await response.json();
          this.details.products = data.products;
        } catch (error) {
          console.error('Error fetching shopping cart:', error);
        }
      },
       

      async updateProduct(id) {
        // Find the product in the products array based on its id
        const product = this.details.products.find((p) => p.id === id);
    
        // Check if the product is found
        if (product) {
          // Update the product's quantity to the input value
          const response = await fetch(`/updatecart/${id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: this.details.user_id,
              quantity: product.quantity,
            }),
          });
    
          const data = await response.json();
    
          if (response.ok) {
            alert(data.message);
            this.$router.go(0)
          } else {
            alert(data.message);
            this.$router.go(0)
          }
        }
    
        // Optionally, you can send an update request to the server here if needed
    
        // Force a re-render to update the view
        this.$forceUpdate();
      },
    
      async removeProduct(id) {
        console.log('Remove product:', id);
        console.log(this.user_id);
        const res = await fetch(`/deleteitem/${id}`,{
            method:"POST",
            headers: {
                'Authentication-Token': this.authToken,
                'Content-Type':'application/json',
            },
            body: JSON.stringify(this.details),
            
        })
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          this.$router.go(0)
        } else {
          alert(data.message);
        }
        
      },

      async order_now(){
        const res = await fetch(`/ordernow`,{
          method:"POST",
          headers:{
            'Authentication-Token': this.authToken,
            'Content-Type':'application/json',
          },
          body:JSON.stringify(this.details),
        })
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          this.$router.push('/')
        } else {
          alert(data.message);
        }
      },

      async clear_cart(){
        const res = await fetch(`/clearcart`,{
          method:"POST",
          headers: {
              'Authentication-Token': this.authToken,
              'Content-Type':'application/json',
          },
          body: JSON.stringify(this.details),
          
      },
      )
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        this.$router.push('/')
      } else {
        alert(data.message);
      }
      },
      calculateSubtotal(product) {
        
        return product.price * product.quantity - (product.discount * product.quantity * product.price) / 100;
      },
      continue_shop(){
        console.log("Products in the cart:");
        console.log("grand total is",this.grand_total);
    this.details.products.forEach(product => {
        console.log(`Product: ${product.name}, Stock: ${product.stock}`);
    });
        this.$router.push('/')
      }
    },
  };
  