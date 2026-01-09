export interface IssueDetectionResponse {
    ai_detection_result: string;
    confidence: number;
    image_count: number;
}

export async function detectIssue(
    images: File[]
): Promise<IssueDetectionResponse> {
    const formData = new FormData();

    images.forEach((file) => {
        formData.append("images", file); // MUST match FastAPI param
    });

    const response = await fetch(
        "http://127.0.0.1:8001/detect_issue",
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
