import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [target, setTarget] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/user/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
      setDeleteModal(false);
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container">
      <h2 className="mainTitle">All Users</h2>
      {users.length === 0 ? (
        <p className="noUsers">No users found.</p>
      ) : (
        <div className="user-grid">
          {users.map((u) => (
            <div key={u._id} className="user-card">
              <div className="user-info">
                <div className="user-name">{u.name}</div>
                <div className="user-email">{u.email}</div>
              </div>
              <button
                className="btn btnRed"
                onClick={() => {
                  setTarget(u);
                  setDeleteModal(true);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Confirm Delete"
      >
        <p>
          Are you sure you want to delete <strong>{target?.name}</strong>?
        </p>
        <div className="actionsRight">
          <button className="btn btnGray" onClick={() => setDeleteModal(false)}>
            Cancel
          </button>
          <button
            className="btn btnRed"
            onClick={() => handleDelete(target._id)}
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* Internal CSS */}
      <style>{`
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 32px;
          font-family: 'Poppins', sans-serif;
        }

        .mainTitle {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .noUsers {
          font-size: 16px;
          color: #6b7280;
        }

        .user-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .user-card {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .user-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-name {
          font-weight: 700;
          font-size: 16px;
        }

        .user-email {
          color: #6b7280;
          font-size: 14px;
        }

        .btn {
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          border: none;
          transition: 0.2s;
        }

        .btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .btnRed {
          background: #ef4444;
          color: #fff;
        }

        .btnGray {
          background: #f3f4f6;
          color: #111;
        }

        .actionsRight {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 12px;
        }

        @media (max-width: 768px) {
          .user-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
