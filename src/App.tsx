import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
  Navigate,
} from 'react-router-dom'

import { Navbar } from './components/Navbar'
import { PostsList } from '@/features/posts/PostsList'
import { PostForm } from '@/features/posts/PostForm'
import { PostPage } from '@/features/posts/PostPage'
import UserPage from '@/features/users/UserPage'
import { useAppSelector } from '@/hooks'
import { selectCurrentUserId } from '@/features/auth/authSlice'
import { LoginPage } from '@/features/auth/LoginPage'
import { UsersList } from '@/features/users/UsersList'
import NotificationsList from '@/features/notifications/NotificationsList'
import { ToastContainer } from 'react-tiny-toast'
import { useGetPostsQuery } from '@/features/posts/postsSlice'

function Index() {
  const { isError, error } = useGetPostsQuery()

  if (isError) {
    return <div>{error.toString()}</div>
  }

  return (
    <>
      <PostForm />
      <PostsList />
    </>
  )
}

function RequireAuth() {
  const userId = useAppSelector(selectCurrentUserId)
  if (!userId) return <Navigate to={'/'} />

  return <Outlet />
}

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route index element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/posts" element={<Index />}></Route>
            <Route path="/posts/:postId" element={<PostPage />}></Route>
            <Route path="/posts/:postId/edit" element={<PostForm />}></Route>
            <Route path="/users/:userId" element={<UserPage />}></Route>
            <Route path="/users/" element={<UsersList />}></Route>
            <Route
              path="/notifications/"
              element={<NotificationsList />}
            ></Route>
          </Route>
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  )
}

export default App
