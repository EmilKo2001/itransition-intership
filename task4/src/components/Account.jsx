import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import "./Account.css";

function generateDateFromSeconds(seconds) {
  if (seconds === undefined) {
    return "";
  }

  return new Date(seconds * 1000).toLocaleString();
}

export default function Account() {
  const { user, logout } = UserAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [usersChanged, setUsersChanged] = useState(false);

  useEffect(() => {
    const colRef = collection(db, "users");

    const getUsers = async () => {
      await getDocs(colRef)
        .then((res) => {
          const fetcheUsers = [];
          res.forEach((doc) => {
            fetcheUsers.push({ id: doc.id, ...doc.data() });
          });
          setUsers(fetcheUsers);
        })
        .catch((err) => {
          console.error(err.message);
        });
    };

    getUsers();
  }, [usersChanged]);

  const handleCheckboxChange = (selectedUser) => {
    if (selectedUser === "all") {
      setSelectedUsers((prevSelectedUsers) => {
        if (prevSelectedUsers.length > 0) {
          return [];
        } else {
          return users.map((user) => ({ userid: user?.userid, id: user?.id }));
        }
      });
    } else {
      setSelectedUsers((prevSelectedUsers) => {
        if (
          prevSelectedUsers.findIndex(
            (prevUser) => prevUser.id === selectedUser?.id
          ) !== -1
        ) {
          return prevSelectedUsers.filter(
            (prevUser) => prevUser.id !== selectedUser.id
          );
        } else {
          return [...prevSelectedUsers, selectedUser];
        }
      });
    }
  };

  const changeUserStatus = async (status) => {
    try {
      for (const user of selectedUsers) {
        await updateDoc(doc(db, "users", user.id), { status });
      }
      setUsersChanged((prevState) => !prevState);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error removing user:", error.message);
    }
  };

  const handleDelete = async () => {
    try {
      for (const user of selectedUsers) {
        await deleteDoc(doc(db, "users", user.id));
      }
      setUsersChanged((prevState) => !prevState);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error removing user:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      console.log("You are logged out");
    } catch (e) {
      console.error(e.message);
    }
  };

  return (
    <div className="max-w-[600x] mx-auto py-4 px-4">
      <div className="account">
        <h1 className="text-xl  font-medium">Hello,</h1>
        <p className=" text-blue-500 font-medium text-xl underline">
          {user?.name}
        </p>
        <button
          onClick={handleLogout}
          className="text-blue-500 font-medium px-6 text-xl underline"
        >
          Logout
        </button>
      </div>
      <div className="account-content">
        <div className="user-table">
          <button
            onClick={() => changeUserStatus("blocked")}
            className="user-table__block"
          >
            <img src="/images/block.svg" alt="" />
            Block
          </button>
          <button
            onClick={() => changeUserStatus("unlocked")}
            className="user-table__unblock"
          >
            <img src="/images/unlock.svg" alt="" />
          </button>
          <button onClick={handleDelete} className="user-table__delete">
            <img src="/images/trash-can.svg" alt="" />
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange("all")}
                />
              </th>
              <th>Name</th>
              <th>Position</th>
              <th>E-mail</th>
              <th>Last login</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={`user${index}`}>
                <td>
                  <input
                    type="checkbox"
                    onChange={() =>
                      handleCheckboxChange({
                        userid: user?.userid,
                        id: user?.id,
                      })
                    }
                    checked={
                      selectedUsers.findIndex(
                        (selectedUser) => selectedUser.id === user?.id
                      ) !== -1
                    }
                  />
                </td>
                <td>{user?.name}</td>
                <td>{user?.position}</td>
                <td>{user?.email}</td>
                <td>{generateDateFromSeconds(user?.last_login?.seconds)}</td>
                <td>{user?.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
