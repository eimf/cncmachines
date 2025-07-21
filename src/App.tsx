import { useState, useEffect } from "react";
import "./App.css";

interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
}

function App() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    // Responsive breakpoint detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Fetch posts from API
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    "https://jsonplaceholder.typicode.com/posts"
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch posts");
                }
                const data = await response.json();
                // Get first 100 posts as specified
                setPosts(data.slice(0, 100));
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Pagination logic
    const postsPerPage = isMobile ? 4 : 8;
    const totalPages = Math.ceil(posts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const currentPosts = posts.slice(startIndex, startIndex + postsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            // Smooth scroll to top when changing pages
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = isMobile ? 3 : 5;
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2)
        );
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Truncate post body for excerpt
    const truncateText = (text: string, maxLength: number = 120) => {
        return text.length > maxLength
            ? text.substring(0, maxLength) + "..."
            : text;
    };

    // Get color class for post cards
    const getPostColorClass = (index: number) => {
        const colors = [
            "post-orange",
            "post-teal",
            "post-cyan",
            "post-red",
            "post-purple",
            "post-brown",
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="app">
                <div className="main-container">
                    <div className="posts-section">
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading posts...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app">
                <div className="main-container">
                    <div className="posts-section">
                        <div className="error-message">
                            <h2>Oops! Something went wrong</h2>
                            <p>{error}</p>
                            <button
                                className="retry-btn"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <div className="main-container">
                <div className="posts-section">
                    <h1 className="posts-title">Posts</h1>
                    <div
                        className={`posts-grid ${
                            isMobile ? "mobile" : "desktop"
                        }`}
                    >
                        {currentPosts.map((post, index) => (
                            <div
                                key={post.id}
                                className={`post-card ${getPostColorClass(
                                    index
                                )} fade-in`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <h3 className="post-title">{post.title}</h3>
                                <p className="post-description">
                                    {truncateText(post.body)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {!error && totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn prev-next"
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            {getPageNumbers().map((page) => (
                                <button
                                    key={page}
                                    className={`pagination-btn ${
                                        currentPage === page ? "active" : ""
                                    }`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="pagination-btn prev-next"
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
