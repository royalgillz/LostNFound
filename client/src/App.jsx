import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header      from './components/layout/Header';
import Footer      from './components/layout/Footer';
import PrivateRoute from './components/PrivateRoute';
import ToastStack  from './components/ui/Toast';

const Home          = lazy(() => import('./pages/Home'));
const SignIn        = lazy(() => import('./pages/SignIn'));
const SignUp        = lazy(() => import('./pages/SignUp'));
const About         = lazy(() => import('./pages/About'));
const Profile       = lazy(() => import('./pages/Profile'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const UpdateListing = lazy(() => import('./pages/UpdateListing'));
const Listing       = lazy(() => import('./pages/Listing'));
const Search        = lazy(() => import('./pages/Search'));
const Notifications = lazy(() => import('./pages/Notifications'));
const NotFound      = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"                          element={<Home />}          />
              <Route path="/sign-in"                   element={<SignIn />}         />
              <Route path="/sign-up"                   element={<SignUp />}         />
              <Route path="/about"                     element={<About />}          />
              <Route path="/search"                    element={<Search />}         />
              <Route path="/listing/:listingId"        element={<Listing />}        />

              <Route element={<PrivateRoute />}>
                <Route path="/profile"                 element={<Profile />}        />
                <Route path="/notifications"           element={<Notifications />}  />
                <Route path="/create-listing"          element={<CreateListing />}  />
                <Route path="/update-listing/:listingId" element={<UpdateListing />} />
              </Route>

              <Route path="*"                          element={<NotFound />}       />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
      <ToastStack />
    </BrowserRouter>
  );
}
