import { Outlet, Navigate } from 'react-router-dom'

const ProtectedRoute = () => {
    const token = localStorage.getItem('token')

    if (!token) {
        return (
            <Navigate
                to={'/'}
                state={{msg: 'Unauthorised user! Please login to access that page'}}
            />
        )
    }

    return (
        <Outlet />
    )

}

export default ProtectedRoute;