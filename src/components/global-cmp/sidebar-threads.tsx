'use client'
import React, { useState } from 'react'
import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenuItem, SidebarMenu } from '@/components/ui/sidebar'
import { LuPin, LuPinOff, LuDownload } from 'react-icons/lu'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IoMdClose } from 'react-icons/io'
import BranchOffIcon from '../../../public/icons/branch-off'
import { getThread, pinThread, deleteThread, renameThread } from '@/action/thread.action' // Adjust path as needed
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from 'lucide-react'
import { DialogOverlay } from '@radix-ui/react-dialog'
import threadsStore from '@/stores/threads.store'

interface Thread {
  _id: string
  threadId: string
  title: string
  isPinned: boolean
  createdAt: string
  userId: string
}

interface ThreadData {
  pin: Thread[]
  today: Thread[]
  week: Thread[]
}

const SidebarThreads = () => {
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const {searchedThreads} = threadsStore()

  // Fetch threads using TanStack Query
  const {
    data: threads,
    isLoading,
    error
  } = useQuery({
    queryKey: ['threads'],
    queryFn: async () => {
      const result = await getThread()
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data as ThreadData
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Pin/Unpin thread mutation
  const pinMutation = useMutation({
    mutationFn: async (threadId: string) => {
      const result = await pinThread({ threadId })
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
      toast.success(data?.isPinned ? 'Thread pinned' : 'Thread unpinned')
    },
    onError: (error) => {
      console.error('Error pinning thread:', error)
      toast.error('Failed to pin/unpin thread')
    }
  })

  // Delete thread mutation
  const deleteMutation = useMutation({
    mutationFn: async (threadId: string) => {
      const result = await deleteThread({ threadId })
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
      toast.success('Thread deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedThread(null)
    },
    onError: (error) => {
      console.error('Error deleting thread:', error)
      toast.error('Failed to delete thread')
    }
  })

  // Rename thread mutation
  const renameMutation = useMutation({
    mutationFn: async ({ threadId, title }: { threadId: string, title: string }) => {
      const result = await renameThread({ threadId, title })
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
      toast.success('Thread renamed successfully')
      setRenameDialogOpen(false)
      setSelectedThread(null)
      setNewTitle('')
    },
    onError: (error) => {
      console.error('Error renaming thread:', error)
      toast.error('Failed to rename thread')
    }
  })

  const handlePinThread = (threadId: string) => {
    pinMutation.mutate(threadId)
  }

  const handleDeleteThread = (threadId: string) => {
    deleteMutation.mutate(threadId)
  }

  const handleRenameThread = () => {
    if (!selectedThread || !newTitle.trim()) return
    renameMutation.mutate({ threadId: selectedThread.threadId, title: newTitle.trim() })
  }

  const handleExportThread = (thread: Thread) => {
    // Basic export functionality - you can enhance this
    const data = {
      title: thread.title,
      threadId: thread.threadId,
      createdAt: thread.createdAt,
      isPinned: thread.isPinned
    }
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `thread-${thread.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Thread exported successfully')
  }

  const openDeleteDialog = (thread: Thread) => {
    setSelectedThread(thread)
    setDeleteDialogOpen(true)
  }

  const openRenameDialog = (thread: Thread) => {
    setSelectedThread(thread)
    setNewTitle(thread.title)
    setRenameDialogOpen(true)
  }
  if (error || isLoading) {
    return (
      <SidebarContent>
      </SidebarContent>
    )
  }

  // Render thread item component
  const ThreadItem = ({ thread, showBranchIcon = false }: { thread: Thread, showBranchIcon?: boolean }) => {
    const isActionLoading = pinMutation.isPending || deleteMutation.isPending
    const isCurrentThreadLoading = pinMutation.variables === thread.threadId || deleteMutation.variables === thread.threadId

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <SidebarMenuItem className="hover:bg-sidebar-accent overflow-hidden flex items-center relative px-0 group/link-item rounded-lg">
            <Link 
              className={`p-2 px-3 ${showBranchIcon ? 'truncate flex items-center gap-2' : 'block'}`}
              href={`/chat/${thread.threadId}`}
            >
              {showBranchIcon && <BranchOffIcon />}
              <p className={showBranchIcon ? 'flex-1 truncate' : ''}>
                {thread.title}
              </p>
            </Link>
            <div className="flex *:size-7 bg-sidebar-accent backdrop-blur-sm transition-[opacity,transform] items-center gap-1 absolute group-hover/link-item:right-1 -right-[100px]">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handlePinThread(thread.threadId)
                }}
                disabled={isActionLoading}
              >
                {isCurrentThreadLoading && pinMutation.isPending ? (
                  <div className="w-3 h-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                ) : thread.isPinned ? (
                  <LuPinOff />
                ) : (
                  <LuPin />
                )}
              </Button>
              <Button
                variant="ghost"
                className="hover:!bg-destructive/50 hover:!text-destructive-foreground"
                size="icon"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  openDeleteDialog(thread)
                }}
                disabled={isActionLoading}
              >
                {isCurrentThreadLoading && deleteMutation.isPending ? (
                  <div className="w-3 h-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                ) : (
                  <IoMdClose />
                )}
              </Button>
            </div>
          </SidebarMenuItem>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-36">
          <ContextMenuItem 
            onClick={() => handlePinThread(thread.threadId)}
            disabled={pinMutation.isPending}
          >
            {thread.isPinned ? <LuPinOff className="mr-2 h-4 w-4" /> : <LuPin className="mr-2 h-4 w-4" />}
            {thread.isPinned ? 'Unpin' : 'Pin'}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => openRenameDialog(thread)}>
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => openDeleteDialog(thread)}
            className="text-destructive focus:text-destructive"
          >
            <IoMdClose className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleExportThread(thread)}>
            <LuDownload className="mr-2 h-4 w-4" />
            Export
            <span className="ml-auto text-xs bg-primary/10 px-1.5 py-0.5 rounded">BETA</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  if(searchedThreads.length > 0){
    return (
      <SidebarContent>
        <SidebarGroup>
              <SidebarMenu>
                {searchedThreads.map((thread) => (
                  <ThreadItem 
                    key={thread.threadId} 
                    thread={thread as any} 
                    showBranchIcon={thread.title.length > 20}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroup>
      </SidebarContent>
    )

  }
    return (
      <>
        <SidebarContent>
          {/* Pinned Threads */}
        {threads?.pin && threads.pin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="gap-1">
              <LuPin className="!w-3 !h-3" /> Pinned
            </SidebarGroupLabel>
            <SidebarMenu>
              {threads.pin.map((thread) => (
                <ThreadItem 
                  key={thread._id} 
                  thread={thread} 
                  showBranchIcon={thread.title.length > 20}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Today's Threads */}
        {threads?.today && threads.today.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Today</SidebarGroupLabel>
            <SidebarMenu>
              {threads.today.map((thread) => (
                <ThreadItem 
                  key={thread._id} 
                  thread={thread} 
                  showBranchIcon={thread.title.length > 20}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Week Threads */}
        {threads?.week && threads.week.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Earlier</SidebarGroupLabel>
            <SidebarMenu>
              {threads.week.map((thread) => (
                <ThreadItem 
                  key={thread._id} 
                  thread={thread} 
                  showBranchIcon={thread.title.length > 20}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Empty state */}
        {(!threads || (threads.pin.length === 0 && threads.today.length === 0 && threads.week.length === 0)) && (
          <div className="p-4 text-center text-muted-foreground">
            No threads found
          </div>
        )}
      </SidebarContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
            <AlertDialogDescription>
            Are you sure you want to delete "{selectedThread?.title}" This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => {
              setDeleteDialogOpen(false)
              setSelectedThread(null)
            }}>
              Cancel
            </Button>
            <AlertDialogAction
              onClick={() => selectedThread && handleDeleteThread(selectedThread.threadId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Thread</DialogTitle>
            <DialogDescription>
              Enter a new name for your thread. This will help you identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="items-center space-y-2">
              <Label htmlFor="thread-title" className="text-right">
                Title
              </Label>
              <Input
                id="thread-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter thread title..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleRenameThread()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => {
                setRenameDialogOpen(false)
                setSelectedThread(null)
                setNewTitle('')
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRenameThread}
              disabled={!newTitle.trim() || renameMutation.isPending}
            >
              {renameMutation.isPending ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SidebarThreads