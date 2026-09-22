import Logo from "../landing/Logo";


export default function RegistrationNavBar() {
    return (
        <nav className="w-full px-4 py-4 sm:px-6 flex items-center">
            <div className="mx-auto flex max-w-7xl items-center">
                <Logo />
            </div>
        </nav>
    );
}