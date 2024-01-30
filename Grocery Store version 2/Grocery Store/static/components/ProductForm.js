// The store manager who add a product is only be able to edit and no other store manager edit this
// product but all the product will be displayed on the store manager side..

export default{
    template:`<div class='justify-content-center' style="margin-top :15 vh">  
    <div class="mb-3 p-5 bg-light" style="max-width: 400px; margin: 0 auto;">
    <div class='d-flex justify-content-center' style='color: green;'><h3>Create Product</h3></div>
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
    
    <label for="category">Select a category</label><br>
    <select id="category" v-model="product.category_id" >
        <option value="" disabled selected>Select a category</option>
        <option v-for="category in categories" :key="category.id" :value="category.id" >{{ category.name }}</option>
    </select><br><br>
    <button class="btn btn-success" @click="create_product">Submit</button>

    </div>
    </div>`,

    data(){
        return{
            product:{
                name:null,
                price:null,
                unit:null,
                manufacturing:null,
                discount:null,
                stock:null,
                desc: null,
                category_id:null
            },
            token:localStorage.getItem('auth-token'),
            role:localStorage.getItem('role'),
            categories: [],
        }
    },

     
    methods:{
        async create_product(){
            const res = await fetch('/api/product',{
                method: 'POST',
                headers: {
                    "Authentication-Token":this.token,
                    "Content-Type":'application/json',
                },
                body: JSON.stringify({
                    name: this.product.name,
                    price: this.product.price,
                    unit: this.product.unit,
                    manufacturing: this.product.manufacturing,
                    discount: this.product.discount,
                    stock: this.product.stock,
                    desc: this.product.desc,  // Ensure the key name matches the server-side code
                    category_id: this.product.category_id
                  }),
            })

            const data = await res.json()

            if(res.ok){
                alert(data.message)
            }
            else{
                alert(data.message)
            }

        },

        async fetchCategories() {
            const res = await fetch('/api/category', {
              headers: {
                'Authentication-Token': this.token,
              },
            });
            const data = await res.json();
      
            // Use the data directly to update categories
            this.categories = data;
      
            console.log('Categories are', this.categories);
          
        },

    },
    mounted() {
        // Fetch categories when the component is mounted
        this.fetchCategories();
      },
}
