import React, { useEffect, useState } from "react";
import UserTable from "../components/UserTable";
import ProductTable from "../components/ProductTable";
import api from "../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch users and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, productsResponse] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/products"),
        ]);
        setUsers(usersResponse.data);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      }
    };
    fetchData();
  }, []);

  // Delete user
  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="section">
        <h2>Manage Users</h2>
        <UserTable users={users} onDeleteUser={handleDeleteUser} />
      </div>
      <div className="section">
        <h2>Manage Products</h2>
        <ProductTable
          products={products}
          onDeleteProduct={handleDeleteProduct}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
