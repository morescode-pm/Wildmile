import { ImageAnnotationPage } from "components/cameratrap/ImageAnnotationPage";
import { Container } from "@mantine/core";
import classes from "styles/cameraTrapLayout.module.css";
export default function Page() {
  return (
    <div className={classes.fullViewport}>
      <ImageAnnotationPage initialImageId={null} />
    </div>
  );
}
