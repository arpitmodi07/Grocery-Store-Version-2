export default{
    template:`<div class='justify-content-center' style="margin-top :15 vh">  
    <div class="mb-3 p-5 bg-light" style="max-width: 400px; margin: 0 auto;">
    <div class='d-flex justify-content-center' style='color: green;'><h3>Update Product</h3></div>
    <label for="mang-name" class="form-label">Enter Product Name</label>
    <input type="text" class="form-control" id="mang-name" placeholder="name" v-model="product.name"/>
    <label for="edit-price" class="form-label">Enter Product Price</label>
    <input type="int" class="form-control" id="edit-price" placeholder="price" v-model="product.price"/>

    <label for="edit-unit" class="form-label">Enter Product Unit</label>
    <input type="text" class="form-control" id="edit-unit" placeholder="unit" v-model="product.unit"/>

    <label for="edit-date" class="form-label">Enter Manufacturing Date</label>
    <input type="date"  class="form-control" id="edit-date" placeholder="manufacturing" v-model="product.manufacturing"/>

    <label for="edit-dis" class="form-label">Enter Product Discount</label>
    <input type="int" class="form-control" id="edit-dis" placeholder="discount" v-model="product.discount"/>
    <label for="edit-stock" class="form-label">Enter Product Stock</label>
    <input type="int" class="form-control" id="edit-stock" placeholder="stock" v-model="product.stock"/>

    <label for="edit-dis" class="form-label">Enter Product Description</label>
    <input type="text" class="form-control" id="edit-date" placeholder="desc" v-model="product.desc"/>
    Select Category<br>
    <select v-model="product.category_id" >
        
        <option v-for="category in categories" :key="category.id" :value="category.id" >{{ category.name }}</option>
    </select><br><br>
    <button class="btn btn-success" @click="edit_product(product.id)">Submit</button>
    </div>
    </div>`,
    data(){
        return{
            product:null,
            authToken:localStorage.getItem('auth-token'),
            categories: [],
        }
    },

    async mounted() {
        this.fetchCategories();
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
         async fetchCategories() {
                const res = await fetch('/api/category', {
                  headers: {
                    'Authentication-Token': this.authToken,
                  },
                });
                const data = await res.json();
          
                // Use the data directly to update categories
                this.categories = data;
          
                console.log('Categories are', this.categories);
              
            },
        async edit_product(id){
            // console.log(data)
            // console.log(product)
            const res= await fetch(`/update/product/${id}`,{
                    
                method:'POST',
                headers:{
                    'Authentication-Token':this.authToken,
                    "Content-Type":'application/json',
                },
                body: JSON.stringify(this.product),
            })
            const data = await res.json()
            console.log(data)
            if(res.ok){
            alert(data.message);
            this.$router.push('/')
            }
            else{
                this.error=data.message
            }
            },
           
        },
        
    }
