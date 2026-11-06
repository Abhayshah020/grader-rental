import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIMessage({ content }: { content: string }) {
    return (
        <div className="ai-markdown min-w-0 text-sm leading-6 text-gray-700">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h3 className="mb-2 mt-3 text-base font-extrabold text-gray-900">
                            {children}
                        </h3>
                    ),
                    h2: ({ children }) => (
                        <h3 className="mb-2 mt-3 text-[15px] font-extrabold text-gray-900">
                            {children}
                        </h3>
                    ),
                    h3: ({ children }) => (
                        <h4 className="mb-1.5 mt-3 font-bold text-gray-900">
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="mb-2 last:mb-0">
                            {children}
                        </p>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-bold text-gray-900">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),
                    del: ({ children }) => (
                        <del className="text-gray-400">{children}</del>
                    ),
                    ul: ({ children }) => (
                        <ul className="my-2 list-disc space-y-1 pl-5 marker:text-[#c58d17]">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-2 list-decimal space-y-1 pl-5 marker:font-bold marker:text-[#805600]">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="pl-1">{children}</li>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#805600] underline decoration-[#e5a928]/50 underline-offset-2 transition hover:text-[#805400]"
                        >
                            {children}
                        </a>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="my-3 border-l-[3px] border-[#e5a928] bg-[#fffaf0] py-2 pl-3 pr-2 text-gray-600">
                            {children}
                        </blockquote>
                    ),
                    hr: () => (
                        <hr className="my-3 border-gray-200" />
                    ),
                    table: ({ children }) => (
                        <div className="my-3 max-w-full overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full min-w-[260px] border-collapse text-left text-xs">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-[#f7f9fa] text-gray-900">
                            {children}
                        </thead>
                    ),
                    th: ({ children }) => (
                        <th className="border-b border-gray-200 px-3 py-2 font-bold">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border-b border-gray-100 px-3 py-2">
                            {children}
                        </td>
                    ),
                    code: ({ children, className }) => {
                        const isBlock = Boolean(className);

                        return isBlock ? (
                            <code className="block whitespace-pre p-3 font-mono text-xs leading-5 text-gray-100">
                                {children}
                            </code>
                        ) : (
                            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[12px] text-[#94650d]">
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="my-3 max-w-full overflow-x-auto rounded-lg bg-[#17232d]">
                            {children}
                        </pre>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
