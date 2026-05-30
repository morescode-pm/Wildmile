import { ImageAnnotationPage } from "components/cameratrap/ImageAnnotationPage";
import { Container } from "@mantine/core";
export default function Page() {
  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <ImageAnnotationPage initialImageId={null} />
    </div>
  );
}
