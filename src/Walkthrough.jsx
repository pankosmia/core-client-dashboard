import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { PanStepperPicker } from "pankosmia-rcl";
import { getJson } from "pithekos-lib";
import { Grid2, Card, CardContent, Typography } from "@mui/material";
export function Walkthrough() {
  const [currentLanguages, setCurrentLanguages] = useState();
  const [walkthrough, setWalkthrough] = useState(null);
  const [walkthroughIndex, setWalkthroughIndex] = useState(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [initStep, setInitStep] = useState(1);
  const [showInitialWorkflow, setShowInitialWorkflow] = useState(
    localStorage.getItem("showInitialWorkflow") === null ? true : false,
  );
  useEffect(() => {
    getJson("/settings/languages")
      .then((res) => res.json)
      .then((data) => {
        setCurrentLanguages(data);
      })
      .catch((err) => console.error("Error :", err));
  }, []);
  const getWalkthroughContent = async (languagesArray) => {
    for (const lang of languagesArray) {
      const response = await fetch(
        `/content-utils/product?resource_path=core-client-dashboard/walk_thru/${lang}/index.json`,
      );

      if (response.ok) {
        const indexData = await response.json();

        const finalGuide = await Promise.all(
          indexData.steps.map(async (step) => {
            const mdResponse = await fetch(
              `/content-utils/product?resource_path=core-client-dashboard/walk_thru/${lang}/${step.bodyPath}`,
            );
            const mdText = mdResponse.ok
              ? await mdResponse.text()
              : "Content unavailable";

            return {
              name: step.title,
              content: mdText,
            };
          }),
        );

        setWalkthroughIndex(indexData);
        setWalkthrough({
          title: indexData.name,
          steps: finalGuide,
        });
        setShowWalkthrough(true);
        return;
      }
    }

    console.warn("No walkthrough found in any language.");
    setShowWalkthrough(false);
    setWalkthrough(null);
  };

  useEffect(() => {
    let array = JSON.parse(
      localStorage.getItem("HistoriqueInitialWorkflow") || "[]",
    );
    if (array.length < 1) {
      localStorage.setItem("HistoriqueInitialWorkflow", "[]");
      return;
    } else if (array.length > 0) {
      let init = array.pop();
      setInitStep(init);
    }
    localStorage.setItem("HistoriqueInitialWorkflow", JSON.stringify(array));
  }, []);
  const isStepValid = (step) => {
    console.log("ici");
    switch (step) {
      case 0:
        return showInitialWorkflow;
      case 1:
        return showInitialWorkflow;
      case 2:
        return showInitialWorkflow;
      default:
        return true;
    }
  };
  const renderStepContent = (step) => {
    let array;
    switch (step) {
      case 0:
        array = JSON.parse(localStorage.getItem("HistoriqueInitialWorkflow"));
        array.push(0 + 1);
        localStorage.setItem(
          "HistoriqueInitialWorkflow",
          JSON.stringify(array),
        );
        return <Markdown fullWidth>{walkthrough?.steps[0]?.content}</Markdown>;
      case 1:
        array = JSON.parse(localStorage.getItem("HistoriqueInitialWorkflow"));
        array.push(1 + 1);
        localStorage.setItem(
          "HistoriqueInitialWorkflow",
          JSON.stringify(array),
        );
        return <Markdown fullWidth>{walkthrough?.steps[1]?.content}</Markdown>;
      case 2:
        array = JSON.parse(localStorage.getItem("HistoriqueInitialWorkflow"));
        array.push(2 + 1);
        localStorage.setItem(
          "HistoriqueInitialWorkflow",
          JSON.stringify(array),
        );
        return <Markdown fullWidth>{walkthrough?.steps[2]?.content}</Markdown>;
      default:
        return null;
    }
  };
  const steps = [
    walkthrough?.steps[0]?.name,
    walkthrough?.steps[1]?.name,
    walkthrough?.steps[2]?.name,
  ];
  useEffect(() => {
    if (currentLanguages && currentLanguages.length > 0) {
      getWalkthroughContent(currentLanguages).then();
    }
  }, [currentLanguages]);
  const handleCreate = async () => {
    setShowInitialWorkflow(false);
    localStorage.setItem("HistoriqueInitialWorkflow", "[]");

    localStorage.setItem("showInitialWorkflow", "initialWorkflowIsDisabled");
  };

  const handleClose = () => {
    setShowInitialWorkflow(false);
    localStorage.setItem("showInitialWorkflow", "initialWorkflowIsDisabled");
  };
  return (
    showInitialWorkflow &&
    walkthrough && (
      <Grid2 item size={12}>
        <Card elevation={1} sx={{ backgroundColor: "#E5F6FD" }}>
          <CardContent>
            <Typography variant="h5" component="div">
              {walkthrough.title}
            </Typography>
            <PanStepperPicker
              steps={steps}
              initialStep={initStep}
              renderStepContent={renderStepContent}
              isStepValid={isStepValid}
              handleCreate={handleCreate}
              handleClose={handleClose}
              requiredFieldsLabel={false}
              primaryActionKey="close"
              primaryButtonVariant="primary"
              secondaryActionKey="back_button"
              secondaryButtonVariant="secondary"
            />
          </CardContent>
        </Card>
      </Grid2>
    )
  );
}
