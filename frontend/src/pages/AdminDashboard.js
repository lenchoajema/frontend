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
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const [usersResponse, productsResponse] = await Promise.all([
          api.get("/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/admin/products", { headers: { Authorization: `Bearer ${token}` } }),
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
      console.log("Deleting user from front end.");
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await api.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      console.log("User deleted successfully from front end.");
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await api.delete(`/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
