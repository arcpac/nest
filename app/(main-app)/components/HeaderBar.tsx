function HeaderBar() {
    return (
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            {/* put sidebar trigger / title / search / user menu here */}
            <div className="font-medium">Page Title</div>
        </header>
    );
}

export default HeaderBar