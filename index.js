const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3001;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

mongoose.connect('mongodb://127.0.0.1:27017/ShoppingSite');

const itemSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: true
    },
    sizes: [
        {
            size: String,
            quantity: Number
        }
    ],
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
});


const userSchema = new mongoose.Schema({
    mail: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: String,
    surname: String,
    postal: String,
    city: String,
    adress: String,
    account: {
        type: String,
        required: true
    },
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            sneakerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item',
                required: true
            },
            size: String,
            size: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    totalValue: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

const ItemsModel = mongoose.model("Items", itemSchema);
  
const UserModel = mongoose.model("User", userSchema);

const OrderModel = mongoose.model("Order", orderSchema);
  
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('home', loggedIn = false);
});

app.get('/admin', (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        res.render('admin', {user: req.session.user});
    }
    else {
        res.redirect('/');
    }
});

app.get('/admin/orders', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const orders = await OrderModel.find().populate('userId', 'name surname city postal adress');
            res.render('admin-orders', {orders, acc: 'admin'});
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/admin/sneakers', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const items = await ItemsModel.find({ category: 'Sneakers' });
            res.render('admin-items', { items, category: 'Sneakers'});
        } catch (error) {
            console.error('Error fetching sneakers:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/admin/ubrania', async (req, res) => {
    const loggedIn = req.session.user ? true : false;

    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const items = await ItemsModel.find({ category: 'Ubrania' });
            res.render('admin-items', { items, category: 'Ubrania' });
        } catch (error) {
            console.error('Error fetching clothes:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/admin/akcesoria', async (req, res) => {
    const loggedIn = req.session.user ? true : false;

    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const items = await ItemsModel.find({ category: 'Akcesoria' });
            res.render('admin-items', { items, category: 'Akcesoria' });
        } catch (error) {
            console.error('Error fetching accessories:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/admin/sneakers/edit/:sneakerId', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const sneakerId = req.params.sneakerId;
            const sneaker = await ItemsModel.findById(sneakerId);

            res.render('editSneaker', { sneaker, errorMessage: '', category: "Sneakers" });
        } catch (error) {
            console.error('Error loading sneaker for edit:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.post('/admin/sneakers/edit/:sneakerId', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const sneakerId = req.params.sneakerId;
            const { brand, gender, imageURL, name, price, slug, sizes } = req.body;

            const sneaker = await ItemsModel.findById(sneakerId);

            sneaker.brand = brand;
            sneaker.gender = gender;
            sneaker.imageURL = imageURL;
            sneaker.name = name;
            sneaker.price = price;
            sneaker.slug = slug;
            sneaker.sizes = JSON.parse(sizes);

            await sneaker.save();

            res.redirect('/admin/sneakers');
        } catch (error) {
            console.error('Error updating sneaker:', error);
            res.render('editSneaker', { sneaker: req.body, errorMessage: 'Błąd podczas aktualizacji buta. Spróbuj ponownie.', category: "Sneakers" });
        }
    } else {
        res.redirect('/');
    }
});

app.get('/admin/ubrania/edit/:sneakerId', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const sneakerId = req.params.sneakerId;
            const sneaker = await ItemsModel.findById(sneakerId);

            res.render('editSneaker', { sneaker, errorMessage: '', category: "Ubrania" });
        } catch (error) {
            console.error('Error loading sneaker for edit:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.post('/admin/ubrania/edit/:sneakerId', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const sneakerId = req.params.sneakerId;
            const { brand, gender, imageURL, name, price, slug, sizes } = req.body;

            const sneaker = await ItemsModel.findById(sneakerId);

            sneaker.brand = brand;
            sneaker.gender = gender;
            sneaker.imageURL = imageURL;
            sneaker.name = name;
            sneaker.price = price;
            sneaker.slug = slug;
            sneaker.sizes = JSON.parse(sizes);

            await sneaker.save();

            res.redirect('/admin/ubrania');
        } catch (error) {
            console.error('Error updating sneaker:', error);
            res.render('editSneaker', { sneaker: req.body, errorMessage: 'Błąd podczas aktualizacji buta. Spróbuj ponownie.', category: "Ubrania" });
        }
    } else {
        res.redirect('/');
    }
});

app.get('/admin/akcesoria/edit/:sneakerId', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const sneakerId = req.params.sneakerId;
            const sneaker = await ItemsModel.findById(sneakerId);

            res.render('editSneaker', { sneaker, errorMessage: '', category: "Akcesoria" });
        } catch (error) {
            console.error('Error loading sneaker for edit:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.post('/admin/akcesoria/edit/:sneakerId', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const sneakerId = req.params.sneakerId;
            const { brand, gender, imageURL, name, price, slug, sizes } = req.body;

            const sneaker = await ItemsModel.findById(sneakerId);

            sneaker.brand = brand;
            sneaker.gender = gender;
            sneaker.imageURL = imageURL;
            sneaker.name = name;
            sneaker.price = price;
            sneaker.slug = slug;
            sneaker.sizes = JSON.parse(sizes);

            await sneaker.save();

            res.redirect('/admin/akcesoria');
        } catch (error) {
            console.error('Error updating sneaker:', error);
            res.render('editSneaker', { sneaker: req.body, errorMessage: 'Błąd podczas aktualizacji buta. Spróbuj ponownie.', category: "Akcesoria" });
        }
    } else {
        res.redirect('/');
    }
});

app.post('/admin/orders/delete/:orderID', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const orderId = req.params.orderID;

            await OrderModel.findByIdAndDelete(orderId);

            res.redirect('/admin/orders');
        } catch (error) {
            console.error('Error deleting order:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/admin/orders/details/:orderId', async (req, res) => {
    const loggedIn = req.session.user ? true : false;

    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const orderId = req.params.orderId;

            const orderDetails = await OrderModel.findById(orderId)
                .populate('userId') 
                .populate('items.sneakerId', null, ItemsModel);

            const cart = orderDetails.items;

            const user = orderDetails.userId;

            res.render('admin-order-details', { orderDetails, cart, user });
        } catch (error) {
            console.error('Error fetching order details:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/user/orders/details/:orderId', async (req, res) => {
    const loggedIn = req.session.user ? true : false;

    if (loggedIn && req.session.user.account === 'user') {
        try {
            const orderId = req.params.orderId;

            const orderDetails = await OrderModel.findById(orderId)
                .populate('userId') 
                .populate('items.sneakerId', null, ItemsModel); 

            const cart = orderDetails.items;

            const user = orderDetails.userId;

            res.render('admin-order-details', { orderDetails, cart, user });
        } catch (error) {
            console.error('Error fetching order details:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.post('/admin/sneakers/delete/:sneakerId', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const sneakerId = req.params.sneakerId;

            await ItemsModel.findByIdAndDelete(sneakerId);

            res.redirect('/admin/sneakers');
        } catch (error) {
            console.error('Error deleting sneaker:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.post('/admin/ubrania/delete/:sneakerId', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const sneakerId = req.params.sneakerId;

            await ItemsModel.findByIdAndDelete(sneakerId);

            res.redirect('/admin/ubrania');
        } catch (error) {
            console.error('Error deleting sneaker:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.post('/admin/akcesoria/delete/:sneakerId', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const sneakerId = req.params.sneakerId;

            await ItemsModel.findByIdAndDelete(sneakerId);

            res.redirect('/admin/akcesoria');
        } catch (error) {
            console.error('Error deleting sneaker:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/admin/sneakers/add', (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        res.render('addSneaker', { errorMessage: '', category: "Sneakers"}, );
    } else {
        res.redirect('/');
    }
});

app.post('/admin/sneakers/add', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const { brand, gender, imageURL, name, price, slug, sizes } = req.body;
            const category = 'Sneakers';

            const newSneaker = new ItemsModel({
                brand,
                category,
                gender,
                imageURL,
                name,
                price,
                slug,
                sizes: JSON.parse(sizes)
            });

            await newSneaker.save();

            res.redirect('/admin/sneakers');
        } catch (error) {
            console.error('Error adding new sneaker:', error);
            res.render('addSneaker', { errorMessage: 'Błąd podczas dodawania nowego buta. Spróbuj ponownie.' });
        }
    } else {
        res.redirect('/');
    }
});

app.get('/admin/ubrania/add', (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        res.render('addSneaker', { errorMessage: '' , category: 'Ubrania'});
    } else {
        res.redirect('/');
    }
});

app.post('/admin/ubrania/add', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const { brand, gender, imageURL, name, price, slug, sizes } = req.body;
            const category = 'Ubrania';

            const newSneaker = new ItemsModel({
                brand,
                category,
                gender,
                imageURL,
                name,
                price,
                slug,
                sizes: JSON.parse(sizes)
            });

            await newSneaker.save();

            res.redirect('/admin/ubrania');
        } catch (error) {
            console.error('Error adding new clothes:', error);
            res.render('addSneaker', { errorMessage: 'Błąd podczas dodawania nowego buta. Spróbuj ponownie.', category: 'Ubrania' });
        }
    } else {
        res.redirect('/');
    }
});

app.get('/admin/akcesoria/add', (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        res.render('addSneaker', { errorMessage: '' , category: 'Akcesoria'});
    } else {
        res.redirect('/');
    }
});

app.post('/admin/akcesoria/add', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const { brand, gender, imageURL, name, price, slug, sizes } = req.body;
            const category = 'Akcesoria';

            const newSneaker = new ItemsModel({
                brand,
                category,
                gender,
                imageURL,
                name,
                price,
                slug,
                sizes: JSON.parse(sizes)
            });

            await newSneaker.save();

            res.redirect('/admin/akcesoria');
        } catch (error) {
            console.error('Error adding new accesory:', error);
            res.render('addSneaker', { errorMessage: 'Błąd podczas dodawania nowego buta. Spróbuj ponownie.', category: 'Akcesoria' });
        }
    } else {
        res.redirect('/');
    }
});

app.get('/admin/users', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const users = await UserModel.find();
            res.render('users', { users });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    else {
        res.redirect('/');
    }
});

app.post('/admin/users/:userId/delete', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const userId = req.params.userId;
    
            await UserModel.findByIdAndDelete(userId);
    
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    else {
        res.redirect('/');
    }
});

app.get('/admin/users/:userId/change-password', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const userId = req.params.userId;
            const user = await UserModel.findById(userId);

            res.render('changePassword', { user }, errorMessage = '');
        } catch (error) {
            console.error('Error loading user for password change:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    else {
        res.redirect('/');
    }   
});

app.post('/admin/users/:userId/change-password', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn && req.session.user.account === 'admin') {
        try {
            const userId = req.params.userId;
            const { newPassword, newPassword2 } = req.body;

            const user = await UserModel.findById(userId);

            if (newPassword !== newPassword2) {
                return res.render('changePassword', { user, errorMessage: 'Nowe hasło i powtórzone nowe hasło nie są identyczne.' });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
            await user.save();

            res.redirect('/admin/users');
        } catch (error) {
            console.error('Error changing user password:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    else {
        res.redirect('/');
    }
});

app.get('/account', (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if(loggedIn){
        if(req.session.user.account == 'admin'){
            res.redirect('admin');
        }
        else{
            res.render('account', { user: req.session.user });
        }
    }   
    else{
        res.render('login', { errorMessage: '' })
    }
});

app.get('/account/orders', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    
    if (loggedIn && req.session.user.account === 'user') {
        try {
            const userId = req.session.user._id;
            const orders = await OrderModel.find({ userId }).populate('userId', 'name surname city postal adress');
            res.render('admin-orders', {orders, acc: 'user'});
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/account/adress', (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if(loggedIn){
        res.render('adress', { user: req.session.user });
    }   
    else{
        res.render('login', { errorMessage: '' })
    }
});

app.get('/account/details', (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if(loggedIn){
        res.render('details', { user: req.session.user, errorMessage: '', successMessage: ''});
    }   
    else{
        res.render('login', { errorMessage: '' })
    }
});

app.post('/account/adress', async (req, res) => {
    const loggedIn = req.session.user ? true : false;

    if (loggedIn) {
        try {
            const userId = req.session.user._id;
            const { name, surname, postal, city, adress } = req.body;

            await UserModel.findByIdAndUpdate(userId, {
                name,
                surname,
                postal,
                city,
                adress
            });

            const updatedUser = await UserModel.findById(userId);

            req.session.user = {
                _id: updatedUser._id,
                mail: updatedUser.mail,
                name: updatedUser.name,
                surname: updatedUser.surname,
                postal: updatedUser.postal,
                city: updatedUser.city,
                adress: updatedUser.adress,
                account: updatedUser.account
            };

            res.render('adress', { user: updatedUser, successMessage: 'Zmiany zostały zapisane.' });
        } catch (error) {
            console.error('Error updating user data:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.render('login', { errorMessage: '' });
    }
});

app.post('/account/details', async (req, res) => {
    const loggedIn = req.session.user ? true : false;

    if (loggedIn) {
        try {
            const userId = req.session.user._id;
            const { currentPassword, newPassword, newPassword2 } = req.body;

            const user = await UserModel.findById(userId);

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                return res.render('details', { errorMessage: 'Aktualne hasło jest nieprawidłowe.', successMessage: ''});
            }

            if (newPassword !== newPassword2) {
                return res.render('details', { errorMessage: 'Nowe hasło i powtórzone nowe hasło nie są identyczne.', successMessage: ''});
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
            await user.save();

            res.render('details', { errorMessage: '', successMessage: 'Hasło zostało zmienione.'});
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.render('login', { errorMessage: '' });
    }
});

app.get('/obuwie', async (req, res) => {
    try {
        const items = await ItemsModel.find({ category: 'Sneakers' });
        res.render('items', { items, category: "Sneakers" });
    } catch (error) {
        console.error('Error fetching sneaker details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/ubrania', async (req, res) => {
    try {
        const items = await ItemsModel.find({ category: 'Ubrania' });
        res.render('items', { items, category: "Ubrania" });
    } catch (error) {
        console.error('Error fetching sneaker details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/akcesoria', async (req, res) => {
    try {
        const items = await ItemsModel.find({ category: 'Akcesoria' });
        res.render('items', { items, category: "Akcesoria" });
    } catch (error) {
        console.error('Error fetching sneaker details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/item/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const sneaker = await ItemsModel.findOne({ slug });
        res.render('itemDetails', { sneaker });
    } catch (error) {
        console.error('Error fetching sneaker details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/item/add-to-cart', (req, res) => {
    const loggedIn = req.session.user ? true : false;

    if (loggedIn) {
        const { sneakerId, size, slug } = req.body;

        if (!req.session.cart) {
            req.session.cart = [];
        }

        req.session.cart.push({ sneakerId, size });

        res.redirect(`/item/${slug}`);
    }
    else {
        res.render('login', { errorMessage: '' });
    }
});

app.post('/login', async (req, res) => {
    const { mail, password } = req.body;

    try {
        const user = await UserModel.findOne({ mail });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { errorMessage: 'Niepoprawne dane' });
        }
        req.session.user = {
            _id: user._id,
            mail: user.mail,
            name: user.name,
            surname: user.surname,
            password: user.password,
            postal: user.postal,
            city: user.city,
            adress: user.adress,
            account: user.account


        };
        const loggedIn = true;

        res.render('home', { loggedIn });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/register', (req, res) => {
    res.render('register', { errorMessage: null });
});

app.post('/register', async (req, res) => {
    try {
        const { name, surname, password, mail } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserModel({
            name,
            surname,
            password: hashedPassword,
            mail,
            postal: '',
            city: '',
            adress: '',
            account: 'user'
        });

        await newUser.save();

        req.session.user = {
            _id: newUser._id,
            mail: newUser.mail,
            name: newUser.name,
            surname: newUser.surname
        };

        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        res.render('register', { errorMessage: 'Błąd rejestracji. Spróbuj ponownie.' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/cart', async (req, res) => {
    const loggedIn = req.session.user ? true : false;

    if (loggedIn) {
        try {
            const cart = req.session.cart || [];
            const user = req.session.user;

            const cartWithDetails = await Promise.all(cart.map(async item => {
                const sneaker = await ItemsModel.findById(item.sneakerId);
                const selectedSize = sneaker.sizes.find(sizeInfo => sizeInfo.size === item.size);
                const remainingStock = selectedSize ? selectedSize.quantity : 0;
                return {
                    sneakerId: item.sneakerId,
                    name: sneaker.name,
                    size: item.size,
                    price: sneaker.price,
                    imageURL: sneaker.imageURL,
                    remainingStock: remainingStock
                };
            }));

            const totalValue = cartWithDetails.reduce((total, item) => {
                return total + item.price;
            }, 0);

            if (user.name && user.surname && user.postal && user.city && user.adress) {
                res.render('cart', { cart: cartWithDetails, user: user, errorMessage: '', totalValue});
            } else {
                res.render('cart', { cart: cartWithDetails, user: user, totalValue, errorMessage: 'Przed zakupem wypełnij wszystkie dane w panelu użytkownika' });
            }
        } catch (error) {
            console.error('Error fetching cart details:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.render('login', { errorMessage: '' });
    }
});

app.post('/cart/confirm', async (req, res) => {
    const loggedIn = req.session.user ? true : false;
    if (loggedIn) {
        try {
            const cart = req.session.cart || [];
            const user = req.session.user;

            const groupedCart = groupCartItems(cart);

            const availabilityCheck = await checkItemsAvailability(groupedCart);

            if (availabilityCheck.success) {
                const cartWithDetails = await Promise.all(availabilityCheck.cart.map(async item => {
                    const sneaker = await ItemsModel.findById(item.sneakerId);
                    const selectedSize = sneaker.sizes.find(sizeInfo => sizeInfo.size === item.size);
                    const remainingStock = selectedSize ? selectedSize.quantity : 0;
                    return {
                        sneakerId: item.sneakerId,
                        name: sneaker.name,
                        size: item.size,
                        price: sneaker.price,
                        imageURL: sneaker.imageURL,
                        remainingStock: remainingStock,
                        quantity: item.quantity
                    };
                }));

                const totalValue = cartWithDetails.reduce((total, item) => {
                    return total + item.price * item.quantity;
                }, 0);

                const order = new OrderModel({
                    userId: user._id,
                    items: cartWithDetails.map(item => ({
                        sneakerId: item.sneakerId,
                        size: item.size,
                        quantity: item.quantity
                    })),
                    totalValue: totalValue
                });

                await order.save();
                await updateStock(cartWithDetails);
                
                req.session.cart = [];

                res.render('orderConfirm', { cart: cartWithDetails, user: user, totalValue});
            } else {
                const cartWithDetails = await Promise.all(cart.map(async item => {
                    const sneaker = await ItemsModel.findById(item.sneakerId);
                    const selectedSize = sneaker.sizes.find(sizeInfo => sizeInfo.size === item.size);
                    const remainingStock = selectedSize ? selectedSize.quantity : 0;
                    return {
                        sneakerId: item.sneakerId,
                        name: sneaker.name,
                        size: item.size,
                        price: sneaker.price,
                        imageURL: sneaker.imageURL,
                        remainingStock: remainingStock
                    };
                }));
    
                const totalValue = cartWithDetails.reduce((total, item) => {
                    return total + item.price;
                }, 0);
                if (user.name && user.surname && user.postal && user.city && user.adress) {
                    res.render('cart', { cart: cartWithDetails, user: user, errorMessage: availabilityCheck.errorMessage, totalValue});
                } else {
                    res.render('cart', { cart: cartWithDetails, user: user, totalValue, errorMessage: 'Przed zakupem wypełnij wszystkie dane w panelu użytkownika' });
                }
            }
        } catch (error) {
            console.error('Error fetching cart details:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.render('login', { errorMessage: '' });
    }
});

async function updateStock(cartWithDetails) {
    try {
        for (const item of cartWithDetails) {
            const sneaker = await ItemsModel.findById(item.sneakerId);
            const selectedSize = sneaker.sizes.find(sizeInfo => sizeInfo.size === item.size);

            if (selectedSize) {
                selectedSize.quantity -= item.quantity;

                await sneaker.save();
            }
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        throw new Error('Error updating stock');
    }
}

function groupCartItems(cart) {
    const groupedCart = {};
    cart.forEach(item => {
        const key = `${item.sneakerId}_${item.size}`;
        if (!groupedCart[key]) {
            groupedCart[key] = {
                sneakerId: item.sneakerId,
                size: item.size,
                quantity: 1
            };
        } else {
            groupedCart[key].quantity += 1;
        }
    });
    return Object.values(groupedCart);
}

async function checkItemsAvailability(groupedCart) {
    const availabilityCheck = {
        success: true,
        errorMessage: '',
        cart: []
    };

    for (const item of groupedCart) {
        const sneaker = await ItemsModel.findById(item.sneakerId);
        const selectedSize = sneaker.sizes.find(sizeInfo => sizeInfo.size === item.size);
        const remainingStock = selectedSize ? selectedSize.quantity : 0;

        if (remainingStock < item.quantity) {
            availabilityCheck.success = false;
            availabilityCheck.errorMessage = 'Brak wystarczającej ilości przedmiotu w magazynie.';
            break;
        }

        availabilityCheck.cart.push({
            sneakerId: item.sneakerId,
            size: item.size,
            quantity: item.quantity
        });
    }

    return availabilityCheck;
}

app.get('/search', async (req, res) => {
    try {
        var searchQuery = "";
        if(req.query.query != undefined) {
            searchQuery = req.query.query;
        }
        const items = await ItemsModel.find({
            $or: [
                { brand: { $regex: new RegExp(searchQuery, 'i') } },
                { category: { $regex: new RegExp(searchQuery, 'i') } },
                { name: { $regex: new RegExp(searchQuery, 'i') } },
            ],
        });
        res.render('search', { items, query: searchQuery });
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/cart/remove', (req, res) => {
    const loggedIn = req.session.user ? true : false;

    if (loggedIn) {
        const { sneakerId, size } = req.body;

        const indexToRemove = req.session.cart.findIndex(item => item.sneakerId === sneakerId && item.size === size);

        if (indexToRemove !== -1) {
            req.session.cart.splice(indexToRemove, 1);
        }

        res.redirect('/cart');
    } else {
        res.render('login', { errorMessage: '' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});