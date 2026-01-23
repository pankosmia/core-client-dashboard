import React, { useState, useEffect, useContext } from "react";
import {
  Grid2,
  Card,
  CardContent,
  CardActionArea,
  CardActions,
  Box,
  Button,
  Typography,
  Stack,
  Chip,
  Tooltip,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { getAndSetJson, doI18n, postEmptyJson, getJson } from "pithekos-lib";
import { i18nContext, netContext, debugContext } from "pankosmia-rcl";

const getEditDocumentKeys = (data) => {
  let map = {};
  for (let [l, v] of Object.entries(data)) {
    if (!v.endpoints) continue;
    for (let [k, t] of Object.entries(v.endpoints)) {
      if (t.edit) {
        if (!map[k]) {
          map[k] = [];
        }

        map[k].push(`${l}#${t.edit.url}`);
      }
    }
  }
  return map;
};

function App() {
  const [clients, setClients] = useState([]);
  const [editTable, setEditTable] = useState({});
  const [projectSummaries, setProjectSummaries] = useState({});
  const [showWelcome, setShowWelcome] = useState(
    localStorage.getItem("showWelcome") === null ? true : false,
  );
  const [themeSpec, setThemeSpec] = useState({
    palette: {
      primary: {
        main: "#666",
      },
      secondary: {
        main: "#888",
      },
    },
  });

  useEffect(() => {
    if (
      themeSpec.palette &&
      themeSpec.palette.primary &&
      themeSpec.palette.primary.main &&
      themeSpec.palette.primary.main === "#666"
    ) {
      getAndSetJson({
        url: "/app-resources/themes/default.json",
        setter: setThemeSpec,
      }).then();
    }
  });

  console.log(themeSpec);

  const theme = createTheme(themeSpec);
  const getProjectSummaries = async () => {
    const summariesResponse = await getJson(
      `/burrito/metadata/summaries`,
      debugRef.current,
    );
    if (summariesResponse.ok) {
      setProjectSummaries(summariesResponse.json);
    }
  };
  console.log(theme);
  useEffect(() => {
    getProjectSummaries().then();
  }, []);

  useEffect(() => {
    getAndSetJson({
      url: "/list-clients",
      setter: setClients,
    }).then();
  }, []);

  useEffect(() => {
    getJson("/client-interfaces")
      .then((res) => res.json)
      .then((data) => setEditTable(getEditDocumentKeys(data)))
      .catch((err) => console.error("Error :", err));
  }, []);

  const editableRepos = Object.entries(projectSummaries).filter(
    ([repoPath, project]) =>
      repoPath.startsWith("_local_/_local_") &&
      !repoPath.includes("images") &&
      editTable[project.flavor],
  );
  const { i18nRef } = useContext(i18nContext);
  const { enabledRef } = useContext(netContext);
  const { debugRef } = useContext(debugContext);

  const flavorTypes = {
    texttranslation: "scripture",
    audiotranslation: "scripture",
    "x-bcvnotes": "parascriptural",
    "x-bnotes": "parascriptural",
    "x-bcvarticles": "parascriptural",
    "x-bcvquestions": "parascriptural",
    "x-bcvimages": "parascriptural",
    "x-juxtalinear": "scripture",
    "x-parallel": "parascriptural",
    textstories: "gloss",
    "x-obsquestions": "peripheral",
    "x-obsnotes": "peripheral",
    "x-obsarticles": "peripheral",
    "x-obsimages": "peripheral",
    "x-tcore": "parascriptural",
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          mb: 2,
          position: "fixed",
          top: "64px",
          bottom: 0,
          right: 0,
          overflow: "auto",
          width: "100%",
        }}
      >
        <Grid2 container spacing={2} sx={{ m: 2 }}>
          {showWelcome && (
            <Grid2 item size={12}>
              <Card elevation={1} sx={{ backgroundColor: "#E5F6FD" }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {doI18n("pages:core-dashboard:welcome", i18nRef.current)}
                  </Typography>
                  <Typography sx={{ mt: 2 }} color="gray" variant="body2">
                    {`${doI18n(
                      "branding:software:name",
                      i18nRef.current,
                    )} ${doI18n(
                      "pages:core-dashboard:welcome_desc1",
                      i18nRef.current,
                    )}`}
                    <br />
                    {doI18n(
                      "pages:core-dashboard:welcome_desc2",
                      i18nRef.current,
                    )}
                    <br />
                    <br />
                    {`${doI18n(
                      "branding:software:name",
                      i18nRef.current,
                    )} ${doI18n(
                      "pages:core-dashboard:welcome_desc3",
                      i18nRef.current,
                    )}`}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => {
                      setShowWelcome(false);
                      localStorage.setItem("showWelcome", "welcomeIsDisabled");
                    }}
                  >
                    {doI18n("pages:core-dashboard:close", i18nRef.current)}
                  </Button>
                </CardActions>
              </Card>
            </Grid2>
          )}
          <Grid2 item size={12}>
            <Stack direction="row" spacing={1}>
              {!enabledRef?.current ? (
                <Tooltip
                  slotProps={{
                    popper: {
                      modifiers: [
                        { name: "offset", options: { offset: [15, -5] } },
                      ],
                    },
                  }}
                  title={doI18n(
                    "pages:core-dashboard:connect_to_internet",
                    i18nRef.current,
                  )}
                >
                  <span>
                    <Chip
                      label={doI18n(
                        "pages:core-dashboard:download_from_internet",
                        i18nRef.current,
                      )}
                      color="secondary"
                      variant="outlined"
                      disabled
                    />
                  </span>
                </Tooltip>
              ) : (
                <Chip
                  label={doI18n(
                    "pages:core-dashboard:download_from_internet",
                    i18nRef.current,
                  )}
                  color="secondary"
                  variant="outlined"
                  onClick={() => (window.location.href = "/clients/download")}
                />
              )}
              <Chip
                label={doI18n(
                  "pages:core-dashboard:create_content",
                  i18nRef.current,
                )}
                color="secondary"
                variant="outlined"
                onClick={() => (window.location.href = "/clients/content")}
              />
            </Stack>
          </Grid2>
          <Grid2 item size={12} sx={{ mt: 2 }}>
            <Typography variant="h5">
              {doI18n("pages:core-dashboard:my_work", i18nRef.current)}
            </Typography>
          </Grid2>
          {editableRepos.length > 0 ? (
            editableRepos.map((repo) => (
              <Grid2 item size={{ xs: 12, md: 6, xl: 4 }}>
                <Card elevation={1}>
                  <CardActionArea
                    onClick={async () => {
                      const fullMetadataResponse = await getJson(
                        `/burrito/metadata/raw/${repo[0]}`,
                      );
                      if (fullMetadataResponse.ok) {
                        const bookCodes = Object.entries(
                          fullMetadataResponse.json.ingredients,
                        )
                          .map((i) => Object.keys(i[1].scope || {}))
                          .reduce((a, b) => [...a, ...b], []);
                        await postEmptyJson(
                          `/navigation/bcv/${bookCodes[0]}/1/1`,
                        );
                        await postEmptyJson(
                          `/app-state/current-project/${repo[0]}`,
                        );
                        window.location.href =
                          "/clients/" + editTable[repo[1].flavor];
                      } else {
                        console.log("Metadata fetch failed");
                        console.log(fullMetadataResponse);
                      }
                    }}
                  >
                    <CardContent sx={{ flex: "1 0 auto" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexDirection: "row",
                        }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography
                            component="div"
                            variant="h5"
                            sx={{ color: "text.primary" }}
                          >
                            {repo[1].name}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            component="div"
                            sx={{ color: "text.secondary" }}
                          >
                            {doI18n(
                              `flavors:names:${
                                flavorTypes[repo[1].flavor.toLowerCase()]
                              }/${repo[1].flavor}`,
                              i18nRef.current,
                            )}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            component="div"
                            sx={{ color: "text.secondary" }}
                          >
                            {repo[1].abbreviation}
                          </Typography>
                          {repo[1].book_codes.length > 0 && (
                            <Typography
                              variant="subtitle1"
                              component="div"
                              sx={{ color: "text.secondary" }}
                            >
                              {`${repo[1].book_codes.length} ${doI18n(
                                `pages:core-dashboard:book${
                                  repo[1].book_codes.length === 1 ? "" : "s"
                                }`,
                                i18nRef.current,
                              )}`}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid2>
            ))
          ) : (
            <Grid2 item>
              <Typography variant="body1" color="gray">
                {doI18n("pages:core-dashboard:my_work_desc", i18nRef.current)}
              </Typography>
            </Grid2>
          )}
          <Grid2 item size={12} sx={{ mt: 2 }}>
            <Typography variant="h5">
              {doI18n("pages:core-dashboard:navigate_to", i18nRef.current)}
            </Typography>
          </Grid2>
          <Grid2
            justifyItems="flex"
            justifyDirection="row"
            alignItems="stretch"
            item
            size={12}
          >
            {clients
              .filter((c) => !c.id.includes("dashboard"))
              .filter((c) => !c.exclude_from_dashboard)
              .filter(
                (c) =>
                  (c.requires.debug && debugRef.current) || !c.requires.debug,
              )
              .map((c) => (
                <Card
                  sx={{ height: "auto", width: "100%", mb: 2 }}
                  elevation={1}
                >
                  <CardActionArea
                    onClick={() => {
                      if (enabledRef.current || !c.requires.net) {
                        window.location.href = c.url;
                      }
                    }}
                    sx={{
                      height: "auto",
                      backgroundColor: "#FFF",
                      color:
                        enabledRef.current || !c.requires.net
                          ? "#000"
                          : "#9E9E9E",
                      "&:hover": { backgroundColor: "#F5F5F5" },
                    }}
                    disabled={!enabledRef.current && c.requires.net}
                  >
                    <CardContent sx={{ height: "auto" }}>
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        {doI18n(`pages:${c.id}:title`, i18nRef.current)}
                      </Typography>
                      <Typography color="gray">
                        {`${doI18n(
                          `pages:core-dashboard:${c.id}_description`,
                          i18nRef.current,
                        )}${
                          c.id === "i18n-editor"
                            ? ` ${doI18n(
                                "branding:software:name",
                                i18nRef.current,
                              )}.`
                            : "."
                        }`}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
          </Grid2>
        </Grid2>
      </Box>
    </ThemeProvider>
  );
}

export default App;
