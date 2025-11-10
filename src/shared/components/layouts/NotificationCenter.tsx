import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es";
import { useNavigate } from "react-router";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string; // Ruta a la que navegar al hacer click
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemoveNotification?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-secondary" />,
  success: <CheckCircle className="h-4 w-4 text-primary" />,
  warning: <AlertTriangle className="h-4 w-4 text-accent-foreground" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
};

const notificationColors: Record<NotificationType, string> = {
  info: "bg-secondary/10 border-secondary/20",
  success: "bg-primary/10 border-primary/20",
  warning: "bg-accent/30 border-accent/40",
  error: "bg-destructive/10 border-destructive/20",
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
  onNotificationClick,
}) => {
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    onNotificationClick?.(notification);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="button-hover relative h-9 w-9 rounded-full p-0 sm:h-8 sm:w-8"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[85vw] max-w-[18rem] sm:w-80 p-0"
        align="end"
        sideOffset={12}
      >
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-7 text-[11px] px-2"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[240px] sm:h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-2 transition-colors hover:bg-accent/20 group relative sm:p-2.5",
                    !notification.read && "bg-accent/10",
                    notification.link && "hover:bg-accent/30"
                  )}
                >
                  <div className="flex gap-2.5">
                    <div
                      className={cn(
                        "flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center border",
                        notificationColors[notification.type]
                      )}
                    >
                      {notificationIcons[notification.type]}
                    </div>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-1 mb-0.5 sm:gap-1.5">
                        <p
                          className={cn(
                            "text-[11px] font-medium line-clamp-1 sm:text-xs",
                            !notification.read &&
                              "text-foreground font-semibold"
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1 sm:text-[11px]">
                        {notification.message}
                      </p>
                      <p className="text-[9px] text-muted-foreground/70 sm:text-[10px]">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                    {onRemoveNotification && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveNotification(notification.id);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[11px] h-7"
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
