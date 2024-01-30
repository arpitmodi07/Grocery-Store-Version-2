import Home from "./components/Home.js"
import Login from "./components/Login.js"
import Users from "./components/Users.js"
import ProductForm from "./components/ProductForm.js"
import ManagerForm from "./components/ManagerForm.js"
import UserForm from "./components/UserForm.js"
import ProductDescription from "./components/ProductDescription.js"
import EditProduct from "./components/EditProduct.js"
import CategoryForm from "./components/CategoryForm.js"
import Add_to_cart from "./components/Add_to_cart.js"
import UpdateCategory from "./components/UpdateCategory.js"
import SearchResults from "./components/SearchResults.js"

const routes = [{path:'/',component:Home,name:'Home'},
                {path:'/login',component:Login, name: 'Login'},
                {path:'/users',component:Users},
                {path:'/create_product',component:ProductForm},
                {path:'/create_manager',component:ManagerForm, name:"ManagerForm"},
                {path:'/create_user',component:UserForm, name:'UserForm'},
                {path:'/product/details/:id',name:"ProductDetails",component:ProductDescription},
                {path:'/update/product/:id',name:"UpdateProduct",component:EditProduct},
                {path:'/create_category',component:CategoryForm},
                {path:'/update/category/:id',name:"UpdateCategory",component:UpdateCategory},
                {path:'/user/cart',component:Add_to_cart},
                {path: '/search-results', name: "SearchResults", component: SearchResults } ]

export default new VueRouter({
    routes
})