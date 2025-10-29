import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChangePassword } from '../../hooks/useUsers';

export const GuestProfilePage = () => {
  const { user } = useAuthStore();
  const changePasswordMutation = useChangePassword();
  const [successMessage, setSuccessMessage] = useState('');

  const [accountForm, setAccountForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountForm.newPassword !== accountForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: accountForm.currentPassword,
        newPassword: accountForm.newPassword,
      });
      setSuccessMessage('Contraseña actualizada correctamente');
      setAccountForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cambiar la contraseña');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
        <p className="text-gray-600 mt-1">Vista de solo lectura - Invitado</p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Información Personal - Solo Lectura */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Información Personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Nombre</label>
            <p className="text-gray-900 mt-1">{user?.firstName || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Apellido</label>
            <p className="text-gray-900 mt-1">{user?.lastName || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900 mt-1">{user?.email || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Teléfono</label>
            <p className="text-gray-900 mt-1">{user?.phone || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Empresa</label>
            <p className="text-gray-900 mt-1">{user?.company?.name || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Rol</label>
            <p className="text-gray-900 mt-1">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                INVITADO
              </span>
            </p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ℹ️ Como invitado, no puedes editar tu información personal. Contacta al administrador de tu empresa si necesitas realizar cambios.
          </p>
        </div>
      </div>

      {/* Cambiar Contraseña */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Cambiar Contraseña</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual
              </label>
              <input
                type="password"
                required
                value={accountForm.currentPassword}
                onChange={(e) => setAccountForm({ ...accountForm, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                required
                value={accountForm.newPassword}
                onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                required
                value={accountForm.confirmPassword}
                onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Actualizar Contraseña
          </button>
        </div>
      </form>
    </div>
  );
};
