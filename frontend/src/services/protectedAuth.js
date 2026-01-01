export const getProfile = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5001/profile', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return res.json()
}
