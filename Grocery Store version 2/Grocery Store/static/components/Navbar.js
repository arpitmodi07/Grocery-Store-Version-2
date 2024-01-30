export default{
    template:`<div>
    
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <router-link class="nav-link active" aria-current="page" to="/">Home</router-link>
        </li>
        <li class="nav-item" v-if="role=='cust'">
        <router-link class="nav-link" to="/user/cart">Cart</router-link>
        </li>

        <li class="nav-item" v-if="role=='admin'">
          <router-link class="nav-link" to="/users">All Manager Details</router-link>
        </li>
        <li class="nav-item" v-if="role=='mang' || role=='admin'">
          <router-link class="nav-link" to="/create_category">Create Category</router-link>
        </li>

        <li class="nav-item" v-if="role=='mang'">
          <router-link class="nav-link" to="/create_product">Create Product</router-link>
        </li>
        <li class="nav-item" v-if='is_login'>
          <button class="nav-link" @click='logout' >Logout</button>
        </li>
         
      </ul>
        <div v-if="is_login">
        <input v-model="details.query" placeholder="Search" aria-label="Search" >
          
          <button class="btn btn-success" @click="search()">Search</button>
        </div>
        
       

      

    </div>
  </div>
</nav>


</div>`,

data() {
  return {
    details:{
      query:null,
    },
    role: localStorage.getItem('role'),
    is_login: localStorage.getItem('auth-token'),
    searchQuery: '',  // Declare searchQuery here
    searchResults: [],
    showSearchResults: false,  // Declare showSearchResults here
  };
},

methods:{
  logout(){
    localStorage.removeItem('auth-token');
    localStorage.removeItem('role');
    this.$router.push({path:'/login'})
  },
 
  async search(){
    const res = await fetch(`/result`,{
      method: 'POST',
      headers: {
        "Authentication-Token":this.is_login,
        "Content-Type":'application/json',
        },
        body: JSON.stringify(this.details),
    })
    const data = await res.json()

    if(res.ok){
      // alert("hii we did")
      this.searchResults = data
      console.log("Search result is",this.searchResults)
      
      // this.$router.push({ name: 'SearchResults', params: { searchResults: this.searchResults } });
      if (this.$route.name !== 'SearchResults') {
        console.log("NOt search result")
        this.$router.push({ name: 'SearchResults', params: { searchResults: this.searchResults } });
      } else {
        console.log("if search result")
         
        this.$router.replace({ name: 'SearchResults', params: { searchResults: this.searchResults } });
      }
       



  }
  else{
      alert("hip hip hurray")
  }
  }

  
   
},

 


}