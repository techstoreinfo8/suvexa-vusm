
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  RefreshCw,
} from "lucide-react";
import "./Admin.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const STATUSES = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function AdminDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
   const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const getToken = () => sessionStorage.getItem("suvexa-admin-token");

  const logout = () => {
    sessionStorage.removeItem("suvexa-admin-token");
    window.location.assign("/admin");
  };

  const loadEnquiries = async () => {
    const token = getToken();

    if (!token) {
      window.location.assign("/admin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/enquiries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load enquiries.");
      }

      setEnquiries(Array.isArray(result) ? result : result.enquiries || []);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that your server is running."
          : err.message || "Unable to load enquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const updateStatus = async (id, status) => {
    const token = getToken();

    if (!token) {
      logout();
      return;
    }

    setUpdatingId(id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/enquiries/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Status update failed.");
      }

      setEnquiries((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
    } catch (err) {
      setError(err.message || "Unable to update enquiry status.");
      await loadEnquiries();
    } finally {
      setUpdatingId(null);
    }
  };

  const total = enquiries.length;
  const newCount = enquiries.filter(
    (item) => (item.status || "NEW") === "NEW"
  ).length;
  const completedCount = enquiries.filter(
    (item) => item.status === "COMPLETED"
  ).length;
const filteredEnquiries = enquiries.filter((item) => {
  const search = searchTerm.trim().toLowerCase();

  const matchesSearch = [
    item.name,
    item.email,
    item.phone,
    item.subject,
  ].some((value) =>
    String(value || "").toLowerCase().includes(search)
  );

  const matchesStatus =
    statusFilter === "ALL" ||
    (item.status || "NEW") === statusFilter;

  return matchesSearch && matchesStatus;
});
  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString("en-IN");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Suvexa VUSM</h2>
        <p>Administration panel</p>

        <nav>
          <a href="/admin/dashboard" className="active">
            <LayoutDashboard size={18} />
            Dashboard
          </a>

          <a href="#enquiries">
            <ClipboardList size={18} />
            Enquiries
          </a>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage website contact enquiries and their status.</p>
          </div>

          <button className="admin-logout" onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>
        </header>

        <section className="admin-stat-grid">
          <div className="admin-stat-card">
            <span>Total enquiries</span>
            <strong>{total}</strong>
          </div>

          <div className="admin-stat-card">
            <span>New enquiries</span>
            <strong>{newCount}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Completed enquiries</span>
            <strong>{completedCount}</strong>
          </div>
        </section>

        <section className="admin-panel" id="enquiries">
          <div className="admin-panel-heading">
            <h2>Contact enquiries</h2>

            <button
              className="admin-refresh-button"
              onClick={loadEnquiries}
              disabled={loading}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {error && (
            <p className="admin-message admin-error-message" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <p className="admin-message">Loading enquiries...</p>
         ) : filteredEnquiries.length === 0 ? (
            <p className="admin-message"> No matching enquiries found.
            </p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Contact details</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEnquiries.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>

                      <td>
                        <strong>{item.name}</strong>
                        <br />
                        {item.email}
                        <br />
                        {item.phone || "No phone"}
                      </td>

                      <td>{item.subject || "—"}</td>

                      <td>{item.message}</td>

                      <td>{formatDate(item.created_at)}</td>

                      <td>
                        <select
                          className="admin-status-select"
                          value={item.status || "NEW"}
                          disabled={updatingId === item.id}
                          onChange={(event) =>
                            updateStatus(item.id, event.target.value)
                          }
                          aria-label={`Status for enquiry ${item.id}`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>

                        {updatingId === item.id && (
                          <small>Saving...</small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="admin-filters">
  <input
    type="search"
    placeholder="Search name, email, phone or subject..."
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
    aria-label="Search enquiries"
  />

  <select
    value={statusFilter}
    onChange={(event) => setStatusFilter(event.target.value)}
    aria-label="Filter enquiries by status"
  >
    <option value="ALL">All statuses</option>
    {STATUSES.map((status) => (
      <option key={status} value={status}>
        {status.replaceAll("_", " ")}
      </option>
    ))}
  </select>
</div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
