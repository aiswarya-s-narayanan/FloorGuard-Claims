export interface IssueDetectionResponse {
    ai_detection_result: {
        image_clarity: number;
        issue_type: string;
        confidence: number;
        severity: string;
        description: string;
        short_description: string;
        detailed_description: string;
        detailed_escription?: string;
    };
    image_count: number;
}

export async function detectIssue(
    images: File[]
): Promise<IssueDetectionResponse> {
    const formData = new FormData();

    images.forEach((file) => {
        formData.append("images", file); // MUST match FastAPI param
    });

    const apiUrl = import.meta.env.VITE_ISSUE_DETECTION_API_URL || "http://127.0.0.1:8001";
    const response = await fetch(
        `${apiUrl}/detect_issue`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Issue detection failed");
    }

    return response.json();
}
