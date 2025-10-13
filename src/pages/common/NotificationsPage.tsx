import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../../services/notifications.service';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import { toast } from '../../utils/toast';
import { NotificationType } from '../../types/notification.types';
import type { Notification as AppNotification } from '../../types/notification.types';

type Notification = AppNotification;

const TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.INFO]: 'Informacion',
  [NotificationType.SUCCESS]: 'Exito',
  [NotificationType.WARNING]: 'Advertencia',
  [NotificationType.ERROR]: 'Error',
  [NotificationType.PROCESS_UPDATE]: 'Actualizacion de Proceso',
  [NotificationType.TEST_ASSIGNED]: 'Test Asignado',
  [NotificationType.EVALUATION_COMPLETED]: 'Evaluacion Completada',
  [NotificationType.REPORT_READY]: 'Reporte Listo',
};

const TYPE_COLORS: Record<NotificationType, 'blue' | 'green' | 'yellow' | 'red'> = {
  [NotificationType.INFO]: 'blue',
  [NotificationType.SUCCESS]: 'green',
  [NotificationType.WARNING]: 'yellow',
  [NotificationType.ERROR]: 'red',
  [NotificationType.PROCESS_UPDATE]: 'blue',
  [NotificationType.TEST_ASSIGNED]: 'blue',
  [NotificationType.EVALUATION_COMPLETED]: 'green',
  [NotificationType.REPORT_READY]: 'green',
};

const TYPE_ICONS: Record<NotificationType, string> = {
  [NotificationType.INFO]: 'i',
  [NotificationType.SUCCESS]: 'v',
  [NotificationType.WARNING]: '!',
  [NotificationType.ERROR]: 'x',
  [NotificationType.PROCESS_UPDATE]: 'P',
  [NotificationType.TEST_ASSIGNED]: 'T',
  [NotificationType.EVALUATION_COMPLETED]: 'E',
  [NotificationType.REPORT_READY]: 'R',
};

// @ts-ignore - old icons to be removed
const OLD_TYPE_ICONS_UNUSED = {
  info: '=�',
  success: '',
  warning: '�',
  error: 'L',
};

export const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getAll(),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificaci�n marcada como le�da');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas las notificaciones marcadas como le�das');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificaci�n eliminada');
      setSelectedNotification(null);
    },
  });

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];

    return notifications.filter((notification: Notification) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'unread' && !notification.read) ||
        (filter === 'read' && notification.read);

      const matchesSearch =
        notification.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        notification.message?.toLowerCase().includes(debouncedSearch.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [notifications, filter, debouncedSearch]);

  const { currentPage, totalPages, paginatedData, goToPage, nextPage, prevPage } = usePagination(
    filteredNotifications,
    15
  );

  const unreadCount = notifications?.filter((n: Notification) => !n.read).length || 0;

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('�Est�s seguro de que deseas eliminar esta notificaci�n?')) {
      deleteMutation.mutate(id);
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} d�a${diffDays > 1 ? 's' : ''}`;
    return new Date(date).toLocaleDateString('es-CL');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `Tienes ${unreadCount} notificaci�n${unreadCount > 1 ? 'es' : ''} sin leer` : 'No tienes notificaciones sin leer'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            Marcar todas como le�das
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar notificaciones..."
            className="md:col-span-3"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas ({notifications?.length || 0})</option>
            <option value="unread">Sin leer ({unreadCount})</option>
            <option value="read">Le�das ({(notifications?.length || 0) - unreadCount})</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        {paginatedData.length === 0 ? (
          <EmptyState
            icon="="
            title="No hay notificaciones"
            message={searchTerm ? 'No se encontraron notificaciones que coincidan con tu b�squeda' : 'No tienes notificaciones en este momento'}
          />
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {paginatedData.map((notification: Notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full bg-${TYPE_COLORS[notification.type]}-100 flex items-center justify-center text-xl`}>
                        {TYPE_ICONS[notification.type]}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge
                              color={TYPE_COLORS[notification.type]}
                            >
                              {TYPE_LABELS[notification.type]}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {getRelativeTime(notification.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar notificaci�n"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  onPrevious={prevPage}
                  onNext={nextPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <Modal
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          title={selectedNotification.title}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                color={TYPE_COLORS[selectedNotification.type]}
              >
                {TYPE_LABELS[selectedNotification.type]}
              </Badge>
              <span className="text-sm text-gray-500">
                {new Date(selectedNotification.createdAt).toLocaleString('es-CL')}
              </span>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700">{selectedNotification.message}</p>
            </div>

            {selectedNotification.data && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Informaci�n adicional:</h4>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(selectedNotification.data, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => handleDelete(selectedNotification.id)}
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
