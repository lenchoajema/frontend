import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({});
  const [message, setMessage] = useState("");
  const [CurrentPassword, setCurrentPassword] = useState("");
  const [NewPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await api.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfileData(response.data);
        setMessage("");
      } catch (error) {
        setMessage("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await api.put("/user/profile", profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    if (!CurrentPassword || !NewPassword) {
      setMessage("Please fill in both password fields.");
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await api.put("/user/change-password", { currentPassword: CurrentPassword, newPassword: NewPassword }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password changed successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      setMessage("Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  
  
    const handleFileChange = (event) => {
      setProfilePicture(event.target.files[0]); // Set the selected file
    };
  

  const handleUploadProfilePicture = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePicture", profilePicture);

      await api.put("/user/upload-profile-picture", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Profile picture uploaded successfully!");
    } catch (error) {
      setMessage("Failed to upload profile picture.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture-wrapper">
          <img
            src={profileData.profilePicture || "default-profile.png"}
            alt="Profile"
            className="profile-picture"
          />
        </div>
        <h1>Manage Profile</h1>
      </div>
      {message && <p>{message}</p>}
      {loading && <p>Loading...</p>}
      <div className="profile-details">
        <div className="detail">
          <label>Username:</label>
          <input
            type="text"
            value={profileData.username || ""}
            onChange={(e) =>
              setProfileData({ ...profileData, username: e.target.value })
            }
          />
        </div>
        <div className="detail">
          <label>Email:</label>
          <input
            type="email"
            value={profileData.email || ""}
            onChange={(e) =>
              setProfileData({ ...profileData, email: e.target.value })
            }
          />
        </div>
      </div>
      <div className="profile-actions">
        <button type="button" onClick={handleUpdate} disabled={loading}>
          Update Profile
        </button>
      </div>
      <div className="profile-details">
        <div className="detail">
          <label>Current Password:</label>
          <input
            type="password"
            value={CurrentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <label>New Password:</label>
          <input
            type="password"
            value={NewPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="profile-actions">
        <button type="button" onClick={handleChangePassword} disabled={loading}>
          Change Password
        </button>
      </div>
      <div className="profile-details">
        <div className="detail">
          <label>Profile Picture:</label>
          <input
            type="file"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <div className="profile-actions">
        <button type="button" onClick={handleUploadProfilePicture} disabled={loading}>
          Upload Profile Picture
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
