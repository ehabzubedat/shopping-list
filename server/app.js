const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(cors());
app.use(bodyParser.json());

// mongodb connection
const url = 'mongodb+srv://ehabzubedat:qwerty123@cluster1.6uqkjen.mongodb.net/shopping_list?retryWrites=true&w=majority';

mongoose.connect(url).then(() => {
    console.log('Connected to database..')
}).catch((err) => {
    console.log(`Failed to connect to database Error: ${err}`)
})

const Schema = mongoose.Schema;

const productSchema = new Schema({
    product: String,
    quantity: Number,
    isPicked: Boolean 
});

const Product = mongoose.model('Product', productSchema);

app.get('/list', (req, res) => {
    Product.find({}, (err, products) => {
        if(err) {
            res.send(err);
        } else {
            res.send({products: products});
        }
    });
});

app.post('/list/add', (req, res) => {
    const product = new Product({
        product: req.body.productName,
        quantity: req.body.quantity,
        isPicked: false
    });

    product.save((err) => {
        if(err) {
            res.send(err);
        } else {   
            res.send(`{"_id": "${product._id}"}`);
        }
    })
});

app.delete('/list/delete/:id', (req, res) => {
    Product.findOneAndDelete(
        { _id: req.params.id }
    ).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    });
});

app.put('/list/update/:id', (req, res) => {
    Product.findOneAndUpdate(
        { _id: req.params.id },
        [
            { $set: { isPicked: { $not: "$isPicked" } } }
        ]
    ).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    });
});

app.listen(3030, console.log('Listening to port 3030...'))