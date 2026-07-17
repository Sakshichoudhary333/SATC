import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { deleteUserApi, getUsers, updateUserApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';

const PAGE_SIZE_OPTIONS = [8, 10, 15, 20];
const ROLE_OPTIONS = [
  { value: 'all', labelKey: 'admin.users.allRoles' },
  { value: 'admin', labelKey: 'roles.admin' },
  { value: 'driver', labelKey: 'roles.driver' },
  { value: 'customer', labelKey: 'roles.customer' },
];

const EMPTY_FORM = {
  name: '',
  email: '',
  role: 'customer',
  mobile: '',
  licenseNumber: '',
  experience: '',
  driverStatus: 'active',
};

const normalizeUserForm = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
  role: user?.role || 'customer',
  mobile: user?.mobile || '',
  licenseNumber: user?.licenseNumber || '',
  experience: user?.experience ?? '',
  driverStatus: user?.driverStatus || 'active',
});

const AdminUsers = () => {
  const { user: authUser } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [role, setRole] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    getUsers({ page, limit, search, role })
      .then((res) => {
        const arr = Array.isArray(res) ? res : res?.users || [];
        setUsers(arr);
        setTotal(Number(res?.total || arr.length || 0));
        setPages(Number(res?.pages || 0));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, limit, search, role]);

  const stats = useMemo(() => ({
    admins: users.filter((u) => u.role === 'admin').length,
    drivers: users.filter((u) => u.role === 'driver').length,
    customers: users.filter((u) => u.role === 'customer').length,
  }), [users]);

  const selectedUser = useMemo(
    () => users.find((u) => u._id === editId) || null,
    [users, editId]
  );

  useEffect(() => {
    if (selectedUser && editId) {
      setForm(normalizeUserForm(selectedUser));
    }
  }, [selectedUser, editId]);

  const pageStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const pageEnd = Math.min(page * limit, total);
  const canGoPrev = page > 1;
  const canGoNext = page < pages;
  const isSelfEditing = editId === authUser?.id;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setRole('all');
    setPage(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm(normalizeUserForm(item));
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    email: form.email.trim(),
    role: form.role,
    mobile: form.mobile.trim(),
    licenseNumber: form.licenseNumber.trim(),
    ...(form.experience === '' ? {} : { experience: Number(form.experience) }),
    driverStatus: form.driverStatus,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      await updateUserApi(editId, buildPayload());
      handleCancelEdit();
      setLoading(true);
      const res = await getUsers({ page, limit, search, role });
      const arr = Array.isArray(res) ? res : res?.users || [];
      setUsers(arr);
      setTotal(Number(res?.total || arr.length || 0));
      setPages(Number(res?.pages || 0));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (item._id === authUser?.id) return;
    if (!window.confirm(`${t('admin.users.confirmDeleteUser')} (Delete ${item.name || item.email}?)`)) return;

    setDeletingId(item._id);
    setError('');
    try {
      await deleteUserApi(item._id);
      const nextTotal = Math.max(total - 1, 0);
      const nextPages = Math.max(Math.ceil(nextTotal / limit), 0);
      if (page > 1 && page > nextPages) {
        setPage(nextPages || 1);
      } else {
        const res = await getUsers({ page, limit, search, role });
        const arr = Array.isArray(res) ? res : res?.users || [];
        setUsers(arr);
        setTotal(Number(res?.total || arr.length || 0));
        setPages(Number(res?.pages || 0));
      }
      if (editId === item._id) handleCancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pages) return;
    setPage(nextPage);
  };

  const paginationWindow = useMemo(() => {
    if (!pages) return [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, start + 4);
    const windowStart = Math.max(1, end - 4);
    return Array.from({ length: end - windowStart + 1 }, (_, idx) => windowStart + idx);
  }, [page, pages]);

  if (loading && users.length === 0) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">{t('admin.users.usersLabel')}</div>
      <h2 className="dash-title">{t('admin.users.title')}</h2>

      {error && <ErrorMessage message={error} />}

      <div className="admin-stat-grid" style={{ marginBottom: '1rem' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#06b6d422', color: '#06b6d4' }}>👥</div>
          <div className="admin-stat-info">
            <div className="admin-stat-val">{total}</div>
            <div className="admin-stat-label">{t('admin.users.matchingUsers')}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#06b6d422', color: '#06b6d4' }}>▣</div>
          <div className="admin-stat-info">
            <div className="admin-stat-val">{stats.admins}</div>
            <div className="admin-stat-label">{t('admin.users.adminsOnPage')}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#8b5cf622', color: '#8b5cf6' }}>🚚</div>
          <div className="admin-stat-info">
            <div className="admin-stat-val">{stats.drivers}</div>
            <div className="admin-stat-label">{t('admin.users.driversOnPage')}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#10b98122', color: '#10b981' }}>🧑‍💼</div>
          <div className="admin-stat-info">
            <div className="admin-stat-val">{stats.customers}</div>
            <div className="admin-stat-label">{t('admin.users.customersOnPage')}</div>
          </div>
        </div>
      </div>

      <div className="users-toolbar">
        <form className="users-search" onSubmit={handleSearchSubmit}>
          <div className="dark-form-group users-search-field">
            <label>{t('admin.users.searchLabel')}</label>
            <input
              className="dark-input"
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value;
                setSearchInput(value);
                setPage(1);
                setSearch(value.trim());
              }}
              placeholder={t('admin.users.searchPlaceholder')}
            />
          </div>
          <button className="reject-btn" type="button" onClick={handleReset}>{t('admin.users.resetBtn')}</button>
        </form>

        <div className="users-toolbar-filters">
          <div className="dark-form-group users-filter">
            <label>{t('admin.users.roleLabel')}</label>
            <select
              className="dark-input"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
              ))}
            </select>
          </div>
          <div className="dark-form-group users-filter">
            <label>{t('admin.users.pageSizeLabel')}</label>
            <select
              className="dark-input"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} {t('admin.users.perPage')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="users-layout">
        {editId && (
          <div className="dark-card users-editor">
            <div className="dark-card-label">{t('admin.users.editUserLabel')}</div>
            <div className="users-editor-title">{t('admin.users.updateAccountTitle')}</div>
            <div className="users-editor-sub">
              {t('admin.users.editingLabel')} {selectedUser?.name || selectedUser?.email || ''}
            </div>
            {formError && <ErrorMessage message={formError} />}
            <form onSubmit={handleSubmit} className="users-editor-form">
              <div className="admin-form-grid">
                <div className="dark-form-group">
                  <label>{t('admin.users.nameField')}</label>
                  <input className="dark-input" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="dark-form-group">
                  <label>{t('admin.users.emailField')}</label>
                  <input className="dark-input" name="email" type="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="dark-form-group">
                  <label>{t('admin.users.roleLabel')}</label>
                  <select
                    className="dark-input"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={isSelfEditing}
                  >
                    <option value="admin">{t('roles.admin')}</option>
                    <option value="driver">{t('roles.driver')}</option>
                    <option value="customer">{t('roles.customer')}</option>
                  </select>
                </div>
                <div className="dark-form-group">
                  <label>{t('admin.users.mobileField')}</label>
                  <input className="dark-input" name="mobile" value={form.mobile} onChange={handleChange} />
                </div>
                <div className="dark-form-group">
                  <label>{t('admin.users.licenseField')}</label>
                  <input className="dark-input" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} />
                </div>
                <div className="dark-form-group">
                  <label>{t('admin.users.experienceField')}</label>
                  <input className="dark-input" name="experience" type="number" min="0" value={form.experience} onChange={handleChange} />
                </div>
                <div className="dark-form-group">
                  <label>{t('admin.users.driverStatusField')}</label>
                  <select className="dark-input" name="driverStatus" value={form.driverStatus} onChange={handleChange}>
                    <option value="active">{t('admin.users.activeTag')}</option>
                    <option value="inactive">{t('admin.users.inactiveTag')}</option>
                  </select>
                </div>
              </div>
              {isSelfEditing && (
                <div className="users-note">
                  {t('admin.users.lockedSelfRole')}
                </div>
              )}
              <div className="users-editor-actions">
                <button className="approve-btn" type="submit" disabled={submitting}>
                  {submitting ? t('admin.users.saving') : t('admin.users.updateUserBtn')}
                </button>
                <button className="reject-btn" type="button" onClick={handleCancelEdit}>
                  {t('admin.users.cancelBtn')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="dark-card users-table-card">
          <div className="users-table-head">
            <div>
              <div className="users-table-title">{t('admin.users.registryTitle')}</div>
              <div className="users-table-sub">
                {t('admin.users.showingCount')} {pageStart}-{pageEnd} of {total}
              </div>
            </div>
            <div className="users-table-sub">{pages ? `${t('admin.users.pageCount')} ${page} of ${pages}` : t('admin.users.noPages')}</div>
          </div>

          <div className="dark-table-wrap users-table-wrap">
            <table className="dark-table">
              <thead>
                <tr>
                  <th>{t('admin.users.colUser')}</th>
                  <th>{t('admin.users.colRole')}</th>
                  <th>{t('admin.users.colContact')}</th>
                  <th>{t('admin.users.colStatus')}</th>
                  <th>{t('admin.users.colJoined')}</th>
                  <th>{t('admin.users.colEdit')}</th>
                  <th>{t('admin.users.colDelete')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => {
                  const isSelf = item._id === authUser?.id;
                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="users-row-main">
                          <div className="users-avatar">
                            {(item.name || item.email || '?').trim().charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="users-row-name">
                              {item.name || t('admin.users.unnamedUser')}
                              {isSelf && <span className="users-self-tag">{t('admin.users.selfTag')}</span>}
                            </div>
                            <div className="users-row-email">{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${item.role === 'admin' ? 'badge-blue' : item.role === 'driver' ? 'badge-purple' : 'badge-green'}`}>
                          {t('roles.' + item.role)}
                        </span>
                      </td>
                      <td>
                        <div className="users-mini-stack">
                          <span>{item.mobile || '—'}</span>
                          <span>{item.licenseNumber || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="users-mini-stack">
                          <span className={`status-badge ${item.isVerified ? 'badge-green' : 'badge-yellow'}`}>
                            {item.isVerified ? t('admin.users.verifiedTag') : t('admin.users.pendingTag')}
                          </span>
                          <span className={`status-badge ${item.driverStatus === 'inactive' ? 'badge-red' : 'badge-green'}`}>
                            {item.driverStatus === 'inactive' ? t('admin.users.inactiveTag') : t('admin.users.activeTag')}
                          </span>
                        </div>
                      </td>
                      <td>{item.createdAt ? formatDate(item.createdAt) : '—'}</td>
                      <td>
                        <button className="approve-btn" style={{ padding: '0.3rem 0.75rem' }} onClick={() => handleEdit(item)}>
                          {t('admin.users.colEdit')}
                        </button>
                      </td>
                      <td>
                        <button
                          className="reject-btn"
                          style={{ padding: '0.3rem 0.75rem' }}
                          disabled={deletingId === item._id || isSelf}
                          onClick={() => handleDelete(item)}
                        >
                          {deletingId === item._id ? '...' : isSelf ? t('admin.users.lockedTag') : t('admin.users.colDelete')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--dim)', padding: '2rem' }}>
                      {t('admin.users.noUsersMatch')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="users-pagination">
            <button className="topbar-logout" type="button" onClick={() => goToPage(page - 1)} disabled={!canGoPrev}>
              {t('admin.users.prevBtn')}
            </button>
            <div className="users-page-pills">
              {paginationWindow.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`users-page-pill${item === page ? ' active' : ''}`}
                  onClick={() => goToPage(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <button className="topbar-logout" type="button" onClick={() => goToPage(page + 1)} disabled={!canGoNext}>
              {t('admin.users.nextBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
