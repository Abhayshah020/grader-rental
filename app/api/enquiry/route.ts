
import { NextRequest, NextResponse } from "next/server";

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            kind,
            name,
            phone,
            machine,
            start,
            end,
            location,
            details,
        } = body;

        if (!["booking", "contact"].includes(kind)) {
            return NextResponse.json(
                { error: "Invalid enquiry type." },
                { status: 400 }
            );
        }

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof phone !== "string" ||
            !phone.trim()
        ) {
            return NextResponse.json(
                { error: "Name and contact number are required." },
                { status: 400 }
            );
        }

        if (kind === "booking") {
            if (
                !machine ||
                !start ||
                !end ||
                !location ||
                end < start
            ) {
                return NextResponse.json(
                    { error: "Please provide valid booking details." },
                    { status: 400 }
                );
            }
        }

        const fields = [
            ["Name", name],
            ["Contact Number", phone],
            ...(kind === "booking"
                ? [
                    ["Machine", machine],
                    ["Start Date", start],
                    ["End Date", end],
                    ["Work Location", location],
                ]
                : []),
            ["Additional Details", details || "Not provided"],
        ];

        const subject =
            kind === "booking"
                ? `New Machine Rental Booking - ${name.trim()}`
                : `New General Enquiry - ${name.trim()}`;


        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>

            <body style="margin:0; padding:30px 12px; background-color:#f3f5f7; font-family:Arial, Helvetica, sans-serif; color:#263445;">

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                <td align="center">

                    <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="max-width:620px; background-color:#ffffff; border:1px solid #e5e9ed;"
                    >

                    <!-- Header -->
                    <tr>
                        <td style="background-color:#182b3a; padding:30px 32px; border-bottom:4px solid #d9a438;">

                        <p style="margin:0 0 12px; color:#f2bd4e; font-size:10px; font-weight:bold; letter-spacing:2px; text-transform:uppercase;">
                            SIRAHA GRADER ROLLER RENTAL SERVICE
                        </p>

                        <h1 style="margin:0; color:#ffffff; font-size:23px; line-height:1.4; font-weight:700;">
                            ${kind === "booking" ? "Machine Rental Booking Request" : "General Contact Enquiry"}
                        </h1>

                        <p style="margin:9px 0 0; color:#cbd5df; font-size:13px; line-height:1.6;">
                            New website submission · Lahan, Siraha
                        </p>

                        </td>
                    </tr>

                    <!-- Introduction -->
                    <tr>
                        <td style="padding:28px 32px 18px;">

                        <p style="margin:0; color:#344456; font-size:14px; line-height:1.8;">
                            You have received a new ${kind === "booking" ? "machine rental booking request" : "general enquiry"} through your website.
                            Please review the submitted information below.
                        </p>

                        </td>
                    </tr>

                    <!-- Section Heading -->
                    <tr>
                        <td style="padding:10px 32px 14px;">

                        <h2 style="margin:0; color:#182b3a; font-size:15px; font-weight:700;">
                            Submission Details
                        </h2>

                        <div style="width:38px; height:3px; margin-top:9px; background-color:#d9a438;"></div>

                        </td>
                    </tr>

                    <!-- Details Table -->
                    <tr>
                        <td style="padding:0 32px 28px;">

                        <table
                            role="presentation"
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="width:100%; border-collapse:collapse; border:1px solid #e5e9ed;"
                        >

                            ${fields
                    .map(
                        ([label, value], index) => `
                                <tr>
                                    <td
                                    width="36%"
                                    valign="top"
                                    style="
                                        padding:14px 15px;
                                        background-color:${index % 2 === 0 ? "#f5f7f9" : "#ffffff"};
                                        border-bottom:1px solid #e8edf1;
                                        color:#647383;
                                        font-size:12px;
                                        font-weight:700;
                                        line-height:1.6;
                                    "
                                    >
                                    ${escapeHtml(String(label))}
                                    </td>

                                    <td
                                    valign="top"
                                    style="
                                        padding:14px 15px;
                                        background-color:${index % 2 === 0 ? "#f5f7f9" : "#ffffff"};
                                        border-bottom:1px solid #e8edf1;
                                        color:#263445;
                                        font-size:13px;
                                        font-weight:600;
                                        line-height:1.7;
                                        word-break:break-word;
                                    "
                                    >
                                    ${escapeHtml(String(value || "Not provided")).replace(/\n/g, "<br>")}
                                    </td>
                                </tr>
                                `
                    )
                    .join("")}

                        </table>

                        </td>
                    </tr>

                    <!-- Footer Contact -->
                    <tr>
                        <td style="padding:22px 32px; background-color:#f5f7f9; border-top:1px solid #e5e9ed;">

                        <p style="margin:0; color:#344456; font-size:12px; line-height:1.8;">
                            <strong style="color:#182b3a;">Siraha Grader Roller Rental Service</strong>
                            <br />
                            Lahan, Siraha, Nepal
                            <br />
                            Contact: <a href="tel:9702803911" style="color:#a8791f; text-decoration:none; font-weight:bold;">9702803911</a>
                        </p>

                        <p style="margin:16px 0 0; padding-top:14px; border-top:1px solid #e0e5e9; color:#8a96a2; font-size:10px; line-height:1.6;">
                            This is an automated notification generated by your website enquiry form.
                            Please do not reply directly to this automated email.
                        </p>

                        </td>
                    </tr>

                    </table>

                </td>
                </tr>
            </table>

            </body>
            </html>
        `;


        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "api-key": process.env.BREVO_API_KEY!,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    sender: {
                        name: process.env.BREVO_SENDER_NAME || "Siraha Grader Roller Rental Service",
                        email: process.env.BREVO_SENDER_EMAIL,
                    },
                    to: [
                        {
                            email: "abhayshah020@gmail.com",
                            name: "Abhay Shah",
                        },
                    ],
                    subject,
                    htmlContent,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);

            console.error("Brevo email error:", errorData);

            return NextResponse.json(
                { error: "Unable to send your enquiry. Please try again." },
                { status: 502 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Your enquiry has been submitted successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Enquiry API error:", error);

        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
