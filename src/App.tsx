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
import { Spinner } from './components/Spinner'
import {
  selectPostsStatus,
  selectPostsError,
} from './features/posts/postsSlice'

function Index() {
  const postsStatus = useAppSelector(selectPostsStatus)
  const postsError = useAppSelector(selectPostsError)
  if (postsStatus === 'pending') {
    return <Spinner />
  } else if (postsStatus === 'rejected') {
    return <div>{postsError}</div>
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
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
