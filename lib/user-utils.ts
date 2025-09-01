import { User } from '@/hooks/use-users'

/**
 * Format assignee names for display
 * @param users Array of user objects
 * @param showAll Whether to show all names (default: true) or use truncation for very long lists
 * @param maxDisplay Maximum number of names to display before showing count (only used when showAll is false)
 * @returns Formatted string for display
 */
export function formatAssigneeNames(users: User[], showAll: boolean = true, maxDisplay: number = 10): string {
  if (users.length === 0) return 'Unassigned'

  if (users.length === 1) {
    return users[0].name
  }

  // Always show all names by default, or if explicitly requested
  if (showAll || users.length <= maxDisplay) {
    return users.map(user => user.name).join(', ')
  }

  // Only truncate for extremely long lists when showAll is false
  const displayNames = users.slice(0, maxDisplay).map(user => user.name).join(', ')
  const remainingCount = users.length - maxDisplay
  return `${displayNames} +${remainingCount} more`
}

/**
 * Format assignee names for compact display (used in small spaces)
 * @param users Array of user objects
 * @param maxDisplay Maximum number of names to display before showing count
 * @returns Formatted string for compact display
 */
export function formatAssigneeNamesCompact(users: User[], maxDisplay: number = 3): string {
  if (users.length === 0) return 'Unassigned'

  if (users.length === 1) {
    return users[0].name
  }

  if (users.length <= maxDisplay) {
    return users.map(user => user.name).join(', ')
  }

  const displayNames = users.slice(0, maxDisplay).map(user => user.name).join(', ')
  const remainingCount = users.length - maxDisplay
  return `${displayNames} +${remainingCount} more`
}

/**
 * Get initials from user names for avatar display
 * @param users Array of user objects
 * @returns String of initials
 */
export function getAssigneeInitials(users: User[]): string {
  if (users.length === 0) return '?'

  if (users.length === 1) {
    return users[0].name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return 'M' // Multiple users indicator
}

/**
 * Check if a user is assigned to a task
 * @param assignees Array of assignee IDs
 * @param userId User ID to check
 * @returns Boolean indicating if user is assigned
 */
export function isUserAssigned(assignees: string[], userId: string): boolean {
  return assignees.includes(userId)
}

/**
 * Filter tasks by assignee
 * @param tasks Array of tasks
 * @param selectedUserId Selected user ID ('all' for all tasks)
 * @returns Filtered tasks array
 */
export function filterTasksByAssignee<T extends { assignees?: string[] }>(
  tasks: T[], 
  selectedUserId: string
): T[] {
  if (selectedUserId === 'all') {
    return tasks
  }
  
  return tasks.filter(task => 
    task.assignees && task.assignees.includes(selectedUserId)
  )
}
