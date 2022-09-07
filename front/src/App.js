import "./App.css";
import React, { useEffect, useState} from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as yup from "yup";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { 
    TextField, 
    Button,
    List, 
    ListItem,
    ListItemButton, 
    ListItemIcon,
    ListItemText,
    Checkbox,
    IconButton,
    Typography 
}
from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const swal = withReactContent(Swal);

const validationSchema = yup.object({
    productName: yup.string().required("Please enter product name"),
    quantity: yup.number().required("Please select quantity")
});

function App() {
    const [list, setList] = useState([]);

    // Functions that get shopping list products from database 
    const getData = async () => {
        const { data } = await axios.get("http://localhost:3030/list");

        setList(data.products);
    }

    useEffect(() => {
        getData();
    },[]);

    const removeItem = (index, id) => {
        Swal.fire({
            icon: 'question',
            title: 'Are you sure?',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#d9534f'
          }).then((result) => {
            if (result.isConfirmed) {
                const newList = [...list];
                newList.splice(index, 1);
                setList(newList);
                axios.delete(`http://localhost:3030/list/delete/${id}`);
                Swal.fire('Successfully Deleted!', '', 'success');
            }
          });
    }

    const formik = useFormik({
        initialValues: {
            productName: "",
            quantity: 1
        },
        onSubmit: (data, {resetForm}) => {
            axios.post("http://localhost:3030/list/add", {
                productName: data.productName, 
                quantity: data.quantity
            }).then(res => {
                const newList = [...list, {
                    _id: res.data._id,
                    product: data.productName,
                    quantity: data.quantity
                }];
                setList(newList);
                swal.fire({
                    icon: "success",
                    title: "Great!",
                    text: "Product successfully added to your shopping list.",
                });
            }).catch((err) => {
                swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Couldn't!",
                });
            });
            resetForm({data: ""})
        },
        validationSchema: validationSchema
    });
  return (
    <div className="App">
        <form onSubmit={formik.handleSubmit}>
            <TextField
            autoComplete="off"
            id="productName"
            name="productName"
            label="Product"
            margin="normal"
            value={formik.values.productName}
            onChange={formik.handleChange}
            error={formik.touched.productName && Boolean(formik.errors.productName)} 
            helperText={formik.touched.productName && formik.errors.productName}
            />
            <TextField
            id="quantity"
            name="quantity"
            label="Quantity"
            type="number"
            InputLabelProps={{
                shrink: true
            }}
            InputProps={{ inputProps: { min: 1 } }}
            margin="normal"
            value={formik.values.quantity}
            onChange={formik.handleChange}
            error={formik.touched.quantity && Boolean(formik.errors.quantity)} 
            helperText={formik.touched.quantity && formik.errors.quantity}
            />
            <Button type="submit" variant="outlined">Add</Button>
        </form>
        <List>
            <Typography variant="h1" component="h1" fontSize="2rem" fontWeight="bold" textAlign="center" margin='10px'>
                My Shopping List
            </Typography>

            {/* changes to do - check if list is empty */}
            {list.map((product, index) => {
                return (
                    <ListItem
                        key={product._id}
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => removeItem(index, product._id)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                        disablePadding
                        >
                       
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                disableRipple
                            />
                        </ListItemIcon>
                        <ListItemText primary={`${product.product} x ${product.quantity}`} />
                    </ListItem>
                )
            })}
        </List>
    </div>
  );
}

export default App;
