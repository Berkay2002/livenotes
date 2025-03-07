'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { InboxNotification, InboxNotificationList, LiveblocksUIConfig } from "@liveblocks/react-ui"
import { useInboxNotifications, useUnreadInboxNotificationsCount } from "@liveblocks/react/suspense"
import Image from "next/image"
import { ReactNode, useEffect, useState } from "react"

const Notifications = () => {
  const { inboxNotifications } = useInboxNotifications();
  const { count } = useUnreadInboxNotificationsCount();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Check if mobile on client side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Check on resize
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const unreadNotifications = inboxNotifications.filter((notification) => !notification.readAt);

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger className={`relative flex size-10 items-center justify-center rounded-lg transition-all duration-200 ${isOpen ? 'bg-dark-300' : 'hover:bg-dark-200'}`}>
        <div className={`transition-transform duration-200 ${isOpen ? 'scale-110' : ''}`}>
          <Image 
            src="/assets/icons/bell.svg"
            alt="inbox"
            width={24}
            height={24}
            className={isOpen ? 'opacity-100' : 'opacity-80 hover:opacity-100'}
          />
        </div>
        {count > 0 && (
          <div className="absolute right-2 top-2 z-20 size-2 rounded-full bg-blue-500" />
        )}
      </PopoverTrigger>
      <PopoverContent 
        align={isMobile ? "center" : "end"}
        side={isMobile ? "bottom" : undefined}
        className="shad-popover max-w-[90vw] w-[280px] md:w-72 rounded-xl overflow-hidden" 
        sideOffset={8}
      >
        <LiveblocksUIConfig 
          overrides={{
            INBOX_NOTIFICATION_TEXT_MENTION: (user: ReactNode) => (
              <>{user} mentioned you.</>
            )
          }}
        >
          <InboxNotificationList>
            {unreadNotifications.length <= 0 && (
              <p className="py-2 text-center text-dark-500">No new notifications</p>
            )}

            {unreadNotifications.length > 0 && unreadNotifications.map((notification) => (
              <InboxNotification 
                key={notification.id}
                inboxNotification={notification}
                className="bg-dark-200 text-white"
                href={`/documents/${notification.roomId}`}
                showActions={false}
                kinds={{
                  thread: (props) => (
                    <InboxNotification.Thread {...props} 
                      showActions={false}
                      showRoomName={false}
                    />
                  ),
                  textMention: (props) => (
                    <InboxNotification.TextMention {...props} 
                      showRoomName={false}
                    />
                  ),
                  $documentAccess: (props) => (
                    <InboxNotification.Custom {...props} title={props.inboxNotification.activities[0].data.title} aside={<InboxNotification.Icon className="bg-transparent">
                      <Image 
                        src={props.inboxNotification.activities[0].data.avatar as string || ''}
                        width={36}
                        height={36}
                        alt="avatar"
                        className="rounded-full"
                      />
                    </InboxNotification.Icon>}>
                      {props.children}
                    </InboxNotification.Custom>
                  )
                }}
              />
            ))}
          </InboxNotificationList>
        </LiveblocksUIConfig>
      </PopoverContent>
    </Popover>
  )
}

export default Notifications