import { useOthers, useSelf } from '@liveblocks/react/suspense'
import Image from 'next/image';

const ActiveCollaborators = () => {
  const others = useOthers();
  const currentUser = useSelf();
  
  // Filter out the current user from collaborators list
  const collaborators = others
    .filter(other => other.info?.id !== currentUser?.info?.id)
    .map(other => other.info);

  return (
    <ul className="flex items-center -space-x-1.5">
      {collaborators.map(({ id, avatar, name, color }) => (
        <li key={id} className="h-8 w-8">
          <Image 
            src={avatar}
            alt={name}
            width={32}
            height={32}
            className='inline-block h-full w-full rounded-full ring-1 ring-dark-100 object-cover'
            style={{border: `1.5px solid ${color}`}}
          />
        </li>
      ))}
      {/* Show count if there are collaborators */}
      {collaborators.length > 0 && (
        <li className="h-5 flex items-center ml-1">
          <span className="text-xs text-gray-300 bg-dark-300 px-1.5 py-0.5 rounded-md border border-dark-400">
            {collaborators.length}
          </span>
        </li>
      )}
      {/* Show placeholder if no collaborators to maintain width */}
      {collaborators.length === 0 && (
        <li className="flex items-center justify-center h-7 w-7 rounded-full bg-dark-300 border border-dark-400">
          <span className="text-xs text-gray-400">0</span>
        </li>
      )}
    </ul>
  )
}

export default ActiveCollaborators