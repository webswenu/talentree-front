import { useState, useEffect } from "react";
import { useCreateCompany, useUpdateCompany } from "../../hooks/useCompanies";
import {
  useUsers,
  useCreateUser,
  useResetPassword,
} from "../../hooks/useUsers";
import { Company } from "../../types/company.types";
import { UserRole } from "../../types/user.types";
import { toast } from "../../utils/toast";
import { getApiErrorMessage } from "../../utils/apiError";
import { getRutError } from "../../utils/rut";
import { ModalPortal } from "../common/ModalPortal";

interface CompanyModalProps {
  company: Company | null;
  onClose: () => void;
}

export const CompanyModal = ({ company, onClose }: CompanyModalProps) => {
  const isEditing = !!company;
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const createUserMutation = useCreateUser();
  const resetPasswordMutation = useResetPassword();
  // El filtro por rol va en el servidor: ver el comentario en useUsers sobre
  // el tope de 100 y por qué filtrar en el navegador escondía representantes.
  const { data: users, refetch: refetchUsers } = useUsers({
    role: UserRole.COMPANY,
  });

  const [formData, setFormData] = useState({
    name: company?.name || "",
    rut: company?.rut || "",
    industry: company?.industry || "",
    address: company?.address || "",
    city: company?.city || "",
    country: company?.country || "Chile",
    userId: company?.user?.id || "",
  });

  // Estado para el formulario de creación rápida de usuario
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado para cambiar contraseña en modo edición
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showResetPass, setShowResetPass] = useState(false);
  const [showResetConfirmPass, setShowResetConfirmPass] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        rut: company.rut,
        industry: company.industry || "",
        address: company.address || "",
        city: company.city || "",
        country: company.country,
        userId: company.user?.id || "",
      });
    }
  }, [company]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserData({
      ...newUserData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateUser = async () => {
    if (
      !newUserData.firstName ||
      !newUserData.lastName ||
      !newUserData.email ||
      !newUserData.password
    ) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (newUserData.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...userData } = newUserData;
      const createdUser = await createUserMutation.mutateAsync({
        ...userData,
        role: UserRole.COMPANY,
      });

      toast.success("Usuario creado correctamente");

      // Actualizar la lista de usuarios
      await refetchUsers();

      // Seleccionar automáticamente el usuario recién creado
      setFormData({
        ...formData,
        userId: createdUser.id,
      });

      // Limpiar el formulario y ocultarlo
      setNewUserData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setShowUserForm(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Error al crear usuario"));
    }
  };

  const handleResetPassword = async () => {
    if (!company?.user?.id) {
      toast.error("No se puede cambiar la contraseña: usuario no encontrado");
      return;
    }

    if (!resetPasswordData.newPassword) {
      toast.error("Por favor ingresa la nueva contraseña");
      return;
    }

    if (resetPasswordData.newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        userId: company.user.id,
        newPassword: resetPasswordData.newPassword,
      });

      toast.success("Contraseña actualizada correctamente");
      setResetPasswordData({ newPassword: "", confirmPassword: "" });
      setShowResetPassword(false);
      setShowResetPass(false);
      setShowResetConfirmPass(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Error al cambiar contraseña"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing) {
      // El representante ya no es obligatorio: el backend acepta userId ausente
      // (CreateCompanyDto lo marca @IsOptional) y el aislamiento contempla la
      // empresa sin usuario. Se permite crear la empresa antes de tener el
      // contacto real y asignarlo después desde "Editar Empresa".
      // Lo que sí se corta es guardar con el formulario de alta a medio llenar:
      // ahí el usuario cree que dejó un representante y en realidad no lo confirmó.
      if (showUserForm && !formData.userId) {
        toast.error(
          "Primero presiona '✓ Crear y Seleccionar' para confirmar el usuario representante, o cancela el formulario",
        );
        return;
      }

      const rutError = getRutError(formData.rut);
      if (rutError) {
        toast.error(rutError);
        return;
      }
    }

    try {
      if (isEditing) {
        // El RUT sigue sin poder editarse (identifica a la empresa), pero el
        // representante SÍ: antes se descartaba aquí y no había ninguna
        // pantalla para reasignarlo, así que un usuario mal elegido quedaba
        // pegado para siempre. Se manda null explícito para desvincular.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { rut, userId, ...updateData } = formData;
        await updateMutation.mutateAsync({
          id: company.id,
          data: { ...updateData, userId: userId || null },
        });
        toast.success("Empresa actualizada correctamente");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Empresa creada correctamente");
      }
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Error al guardar la empresa"));
    }
  };

  const mutation = isEditing ? updateMutation : createMutation;

  // Un usuario ya puede representar a VARIAS empresas, así que no se descarta a
  // los que tienen una: se ofrecen todos los de rol Empresa. Cuando ya
  // representa a otras se dice en la etiqueta, para que asignarlo sea una
  // decisión y no un descuido.
  //
  // Los inactivos se esconden porque asignarlos no sirve de nada: el login los
  // rechaza con "Usuario inactivo" (auth.service), así que la empresa quedaría
  // con un representante que no puede entrar. El representante ACTUAL se
  // muestra igual aunque esté desactivado: si no, el <select> abriría en blanco
  // y el primer guardado lo borraría sin que nadie lo pidiera.
  const currentUserId = company?.user?.id;
  const availableUsers =
    users?.filter(
      (u) => u.role === UserRole.COMPANY && (u.id === currentUserId || u.isActive),
    ) || [];

  /** "Juan Pérez (juan@x.cl)" o "… — ya representa a Acme" si corresponde. */
  const describeUser = (u: (typeof availableUsers)[number]) => {
    const base = `${u.firstName} ${u.lastName} (${u.email})`;
    const otras = (u.companies || []).filter((c) => c.id !== company?.id);

    if (otras.length === 0) return base;

    return `${base} — ya representa a ${otras.map((c) => c.name).join(", ")}`;
  };

  return (
    <ModalPortal onClose={onClose}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-2xl w-full my-8 shadow-xl max-h-[85dvh] overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">
              {isEditing ? "Editar Empresa" : "Nueva Empresa"}
            </h2>
          </div>

          {mutation.isError && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {getApiErrorMessage(
                mutation.error,
                "Error al guardar la empresa",
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="name"
                >
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  required
                  disabled={mutation.isPending}
                  id="name"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="rut"
                >
                  RUT *
                </label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
                  className="input"
                  placeholder="12345678-9"
                  required
                  disabled={mutation.isPending || isEditing}
                  id="rut"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="industry"
                >
                  Industria
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="input"
                  placeholder="ej: Minería"
                  disabled={mutation.isPending}
                  id="industry"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="city"
                >
                  Ciudad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input"
                  disabled={mutation.isPending}
                  id="city"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="country"
                >
                  País
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="input"
                  disabled={mutation.isPending}
                  id="country"
                />
              </div>

              {/* También en edición: es la única forma de reasignar o
                            liberar al representante de una empresa. */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Usuario Representante
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUserForm(!showUserForm)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    disabled={mutation.isPending}
                  >
                    {showUserForm ? "✕ Cancelar" : "+ Crear Usuario"}
                  </button>
                </div>

                {!showUserForm ? (
                  <>
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      className="input"
                      disabled={mutation.isPending}
                    >
                      <option value="">
                        {isEditing
                          ? "Sin representante"
                          : "Sin representante (asignar después)"}
                      </option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {describeUser(user)}
                        </option>
                      ))}
                    </select>
                    {availableUsers.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        No hay usuarios con rol Empresa activos. Usa "+ Crear
                        Usuario" para agregar uno.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
                    <p className="text-sm text-gray-700 mb-3">
                      Crear nuevo usuario representante
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label
                          className="block text-xs font-medium text-gray-700 mb-1"
                          htmlFor="firstName"
                        >
                          Nombre *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={newUserData.firstName}
                          onChange={handleNewUserChange}
                          className="input text-sm"
                          placeholder="Juan"
                          disabled={createUserMutation.isPending}
                          id="firstName"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-medium text-gray-700 mb-1"
                          htmlFor="lastName"
                        >
                          Apellido *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={newUserData.lastName}
                          onChange={handleNewUserChange}
                          className="input text-sm"
                          placeholder="Pérez"
                          disabled={createUserMutation.isPending}
                          id="lastName"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-medium text-gray-700 mb-1"
                          htmlFor="email"
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={newUserData.email}
                          onChange={handleNewUserChange}
                          className="input text-sm"
                          placeholder="juan@empresa.com"
                          disabled={createUserMutation.isPending}
                          id="email"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-medium text-gray-700 mb-1"
                          htmlFor="phone"
                        >
                          Teléfono
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={newUserData.phone}
                          onChange={handleNewUserChange}
                          className="input text-sm"
                          placeholder="+56912345678"
                          disabled={createUserMutation.isPending}
                          id="phone"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Contraseña * (mín. 8 caracteres)
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={newUserData.password}
                            onChange={handleNewUserChange}
                            className="input text-sm pr-10"
                            placeholder="••••••••"
                            disabled={createUserMutation.isPending}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            disabled={createUserMutation.isPending}
                          >
                            {showPassword ? "👁️" : "👁️‍🗨️"}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Repetir Contraseña *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={newUserData.confirmPassword}
                            onChange={handleNewUserChange}
                            className="input text-sm pr-10"
                            placeholder="••••••••"
                            disabled={createUserMutation.isPending}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            disabled={createUserMutation.isPending}
                          >
                            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleCreateUser}
                        disabled={createUserMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                      >
                        {createUserMutation.isPending
                          ? "Creando..."
                          : "✓ Crear y Seleccionar"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="address"
                >
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input"
                  disabled={mutation.isPending}
                  id="address"
                />
              </div>

              {/* Sección para cambiar contraseña en modo edición */}
              {isEditing && company?.user && (
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Cambiar Contraseña del Usuario
                      </h3>
                      <p className="text-xs text-gray-500">
                        Usuario: {company.user.firstName}{" "}
                        {company.user.lastName} ({company.user.email})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      disabled={mutation.isPending}
                    >
                      {showResetPassword
                        ? "✕ Cancelar"
                        : "🔑 Cambiar Contraseña"}
                    </button>
                  </div>

                  {showResetPassword && (
                    <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nueva Contraseña * (mín. 8 caracteres)
                          </label>
                          <div className="relative">
                            <input
                              type={showResetPass ? "text" : "password"}
                              value={resetPasswordData.newPassword}
                              onChange={(e) =>
                                setResetPasswordData({
                                  ...resetPasswordData,
                                  newPassword: e.target.value,
                                })
                              }
                              className="input text-sm pr-10"
                              placeholder="••••••••"
                              disabled={resetPasswordMutation.isPending}
                            />
                            <button
                              type="button"
                              onClick={() => setShowResetPass(!showResetPass)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              disabled={resetPasswordMutation.isPending}
                            >
                              {showResetPass ? "👁️" : "👁️‍🗨️"}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Repetir Nueva Contraseña *
                          </label>
                          <div className="relative">
                            <input
                              type={showResetConfirmPass ? "text" : "password"}
                              value={resetPasswordData.confirmPassword}
                              onChange={(e) =>
                                setResetPasswordData({
                                  ...resetPasswordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="input text-sm pr-10"
                              placeholder="••••••••"
                              disabled={resetPasswordMutation.isPending}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowResetConfirmPass(!showResetConfirmPass)
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              disabled={resetPasswordMutation.isPending}
                            >
                              {showResetConfirmPass ? "👁️" : "👁️‍🗨️"}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleResetPassword}
                          disabled={resetPasswordMutation.isPending}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm font-medium"
                        >
                          {resetPasswordMutation.isPending
                            ? "Cambiando..."
                            : "✓ Cambiar Contraseña"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={mutation.isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary disabled:opacity-50"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Guardando...
                  </span>
                ) : isEditing ? (
                  "Actualizar"
                ) : (
                  "Crear Empresa"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};
