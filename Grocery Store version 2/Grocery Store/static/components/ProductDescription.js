export default{
    template:` <div>
    
    <h1>
      <span class="font-weight-bold text-primary">
        {{ product.name }}
      </span>
      </h1>
      <div>
      <h4>
      <span class="font-size-218 text-bold">
        Price: {{ product.price }}{{ product.unit }}<br>
      </span>
      </h4>
    </div>
    <div v-if="product.discount" class="text-danger">
     <h4> Discount : {{ product.discount }}% </h4>
    </div>
    
    <div class="mt-3 font-size-16">
      <h4><b>Description:</b> {{ product.desc }}</h4>
    </div><br>
    <div v-if="product.stock">
      <button class="btn btn-success" @click="add_to_cart(product.id)">Add to cart</button>
    </div>
    <div v-else class='text-danger'>
    <h4>Out of stock</h4>
  </div>
  </div>`,
     
    data(){
        return{
          details:{
            user_id:localStorage.getItem('id')
          },
          product:null,
        }
    },

    async mounted() {
        const id = this.$route.params.id;
        
        const res = await fetch(`/product/details/${id}`);
        const data = await res.json();
    
        if (res.ok) {
          this.product = data;
        } else {
          alert(data.message || "Error fetching product details");
        }
        
      },
      methods:{
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
      }
      
}