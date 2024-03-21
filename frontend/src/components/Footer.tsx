const Footer = () => {
    return (
        <div className="py-10 px-4">
            <div className="container mx-auto flex justify-between items-center">
                <span className="text-3xl text-white font-bold tracking-tight">
                    MernMedia
                </span>
                <span className="text-white text-sm font-bold tracking-tight flex gap-5">
                    <p className="cursor-pointer">Privacy Policy</p>
                    <p className="cursor-pointer">Terms of Service</p>
                </span>
            </div>
        </div>
    )
}

export default Footer
