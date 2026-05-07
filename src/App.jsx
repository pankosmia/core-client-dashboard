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
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { getAndSetJson, doI18n, postEmptyJson, getJson } from "pithekos-lib";
import { i18nContext, netContext, debugContext } from "pankosmia-rcl";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SvgVersionManager from "./fileIcon/iconVersionManager";
import Tc4ProjectIcon from "./fileIcon/Tc4ProjectIcon";
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
  const [clientInterfaces, setClientInterfaces] = useState({});
  const [createAnchorEl, setCreateAnchorEl] = useState(null);
  const { i18nRef } = useContext(i18nContext);
  const { enabledRef } = useContext(netContext);
  const { debugRef } = useContext(debugContext);
  const matchPart = "/createDocument/textTranslation";
  const editableRepos = Object.entries(projectSummaries).filter(
    ([repoPath, project]) =>
      repoPath.startsWith("_local_/_local_") &&
      !repoPath.includes("images") &&
      project.flavor != "x-tcore" &&
      (editTable[project.flavor] || project.flavor === "textTranslation"),
  );
  const [chooseRepo, setChooseRepo] = useState(null);
  //const [contentRowAnchorEl, setContentRowAnchorEl] = useState(null);
  const [subMenuButtonSave, setSubMenuButtonSave] = useState(null);
  const [subMenuAboutRepo, setSubMenuAboutRepo] = useState(null);
  const createItems = (() => {
    if (!clientInterfaces) return [];

    const all = Object.entries(clientInterfaces).flatMap(([category, cv]) =>
      Object.values(cv?.endpoints || {}).flatMap((ev) =>
        (ev?.create_document || []).map((doc) => ({
          category,
          label: doI18n(doc.label, i18nRef.current),
          url: `/clients/${category}#${doc.url}?returnTypePage=dashboard`,
        })),
      ),
    );
    // move "Biblical Text" to the front if present
    const idx = all.findIndex(
      (i) => i.url === matchPart || i.url.includes(matchPart),
    );
    if (idx > -1) all.unshift(all.splice(idx, 1)[0]);

    return all;
  })();
  const getProjectSummaries = async () => {
    const summariesResponse = await getJson(
      `/burrito/metadata/summaries`,
      debugRef.current,
    );
    if (summariesResponse.ok) {
      setProjectSummaries(summariesResponse.json);
    }
  };
  useEffect(() => {
    getProjectSummaries().then();
  }, []);

  const handleCreateClose = () => {
    setCreateAnchorEl(null);
  };
  useEffect(() => {
    getAndSetJson({
      url: "/list-clients",
      setter: setClients,
    }).then();
  }, []);

  const handleSubMenuClick = (event) => {
    setSubMenuButtonSave(event.currentTarget);
  };

  useEffect(() => {
    getJson("/client-interfaces")
      .then((res) => res.json)
      .then((data) => {
        setEditTable(getEditDocumentKeys(data));
        setClientInterfaces(data);
      })
      .catch((err) => console.error("Error :", err));
  }, []);

  let createItemExport;
  let createAboutRepo;
  let createVersionManager;
  let createtC4Button;
  let createImportTc4Button;
  if (clientInterfaces) {
    createAboutRepo = Object.entries(clientInterfaces).flatMap(
      ([category, categoryValue]) => {
        const endpoints = categoryValue?.endpoints ?? {};
        return Object.entries(endpoints).flatMap(([key, endpointValue]) => {
          const docs = endpointValue?.about_repo;
          if (!Array.isArray(docs)) return [];

          return docs.map((doc) => ({
            category: key,
            label: doI18n(doc.label, i18nRef.current),
            url: `/clients/${category}#${doc.url.replace("%%REPO_PATH%%", chooseRepo)}?returnTypePage=dashboard`,
          }));
        });
      },
    );
    createItemExport = Object.entries(clientInterfaces).flatMap(
      ([category, categoryValue]) => {
        const endpoints = categoryValue?.endpoints ?? {};
        return Object.entries(endpoints).flatMap(
          ([endpointKey, endpointValue]) => {
            const exportsArray = endpointValue?.export;
            if (!Array.isArray(exportsArray)) return [];

            return exportsArray.flatMap((doc) => {
              const flavorItems = doc?.subMenu?.[0];
              if (!flavorItems) return [];

              return Object.entries(flavorItems).flatMap(
                ([key, items]) =>
                  items.map((item) => ({
                    category: endpointKey, // top-level category
                    endpoint: endpointKey, // endpoint name
                    key, // flavor type (pdf/usfm/zip)
                    label: doI18n(item.label, i18nRef.current),
                    url: `/clients/${category}#${item.url.replace("%%REPO_PATH%%", chooseRepo)}?returnTypePage=dashboard`,
                  })),
                console.log("flavorItems", flavorItems),
              );
            });
          },
        );
      },
    );
    createVersionManager = Object.entries(clientInterfaces).flatMap(
      ([category, categoryValue]) => {
        const endpoints = categoryValue?.endpoints ?? {};

        return Object.values(endpoints).flatMap((endpointValue) => {
          const managerArray = endpointValue?.manager;

          if (!Array.isArray(managerArray)) return [];

          return managerArray.map((item) => ({
            category,
            label: doI18n(item.label, i18nRef.current),
            url: `/clients/${category}#${item.url}`,
          }));
        });
      },
    );
    createtC4Button = Object.entries(clientInterfaces).flatMap(
      ([category, categoryValue]) => {
        const endpoints = categoryValue?.endpoints ?? {};

        return Object.values(endpoints).flatMap((endpointValue) => {
          const tCore = endpointValue?.initDocument;
          if (!Array.isArray(tCore)) return [];
          return tCore.map((item) => ({
            category,
            label: doI18n(item.label, i18nRef.current),
            url: `/clients/${category}#${item.url}`,
          }));
        });
      },
    );
    createImportTc4Button = Object.entries(clientInterfaces).flatMap(
      ([category, categoryValue]) => {
        const endpoints = categoryValue?.endpoints ?? {};

        return Object.values(endpoints).flatMap((endpointValue) => {
          const tCore = endpointValue?.importContent;
          if (!Array.isArray(tCore)) return [];
          return tCore.map((item) => ({
            category,
            label: doI18n(item.label, i18nRef.current),
            url: `/clients/${category}#${item.url}`,
          }));
        });
      },
    );
  }
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
  console.log(
    "aboutRepo categories:",
    createAboutRepo.map((i) => i.category),
  );

  return (
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
                  {`${doI18n("branding:software:name", i18nRef.current)} ${doI18n("pages:core-dashboard:welcome_desc1", i18nRef.current)}`}
                  <br />
                  {doI18n(
                    "pages:core-dashboard:welcome_desc2",
                    i18nRef.current,
                  )}
                  <br />
                  <br />
                  {`${doI18n("branding:software:name", i18nRef.current)} ${doI18n("pages:core-dashboard:welcome_desc3", i18nRef.current)}`}
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
            <Chip
              label={doI18n(
                "pages:core-dashboard:create_content",
                i18nRef.current,
              )}
              color="secondary"
              variant="outlined"
              onClick={(event) => setCreateAnchorEl(event.currentTarget)}
            />
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
                "pages:core-dashboard:go_to_documents",
                i18nRef.current,
              )}
              color="secondary"
              variant="outlined"
              onClick={() => (window.location.href = "/clients/content")}
            />
            {createImportTc4Button.length > 0 && (
              <Chip
                label={doI18n(createImportTc4Button[0].label, i18nRef.current)}
                color="secondary"
                variant="outlined"
                onClick={() =>
                  (window.location.href = createImportTc4Button[0].url)
                }
              />
            )}

            <Menu
              id="grouped-menu"
              anchorEl={createAnchorEl}
              open={!!createAnchorEl}
              onClose={handleCreateClose}
            >
              {createItems.map((item) => (
                <MenuItem onClick={() => (window.location.href = item.url)}>
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexDirection: "row",
                  }}
                >
                  <CardActionArea
                    onClick={async () => {
                      const fullMetadataResponse = await getJson(
                        `/burrito/metadata/raw/${repo[0]}`,
                      );
                      if (fullMetadataResponse.ok) {
                        if (editTable[repo[1].flavor]) {
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
                          window.location.href = `/clients/${editTable[repo[1].flavor]}?returnTypePage=dashboard`;
                        } else if (
                          createAboutRepo &&
                          createAboutRepo.some(
                            (item) =>
                              item.category === repo[1].flavor ||
                              item.category === "all",
                          )
                        ) {
                          const item = createAboutRepo.find(
                            (i) =>
                              i.category === repo[1].flavor ||
                              i.category === "all",
                          );
                          if (item) {
                            const url = item.url.replace(chooseRepo, repo[0]);
                            setChooseRepo(repo[0]);
                            window.location.href = url;
                          }
                        }
                      } else {
                        console.log("Metadata fetch failed");
                        console.log(fullMetadataResponse);
                      }
                    }}
                  >
                    <CardContent sx={{ flex: "1 0 auto" }}>
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
                            `flavors:names:${flavorTypes[repo[1].flavor.toLowerCase()]}/${repo[1].flavor}`,
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
                            {`${repo[1].book_codes.length} ${doI18n(`pages:core-dashboard:book${repo[1].book_codes.length === 1 ? "" : "s"}`, i18nRef.current)}`}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      margin: "4px",
                    }}
                  >
                    {repo[0].includes("_local_/_local_") &&
                      createVersionManager.length > 0 && (
                        <Tooltip
                          title="Version manager"
                          disableInteractive
                          placement="right"
                        >
                          <IconButton
                            onClick={() => {
                              {
                                const vm = createVersionManager[0];
                                window.location.href = `${vm.url}?repoPath=${repo[0]}?returnTypePage=dashboard`;
                              }
                            }}
                            disabled={createVersionManager.length === 0}
                          >
                            <SvgVersionManager />
                          </IconButton>
                        </Tooltip>
                      )}
                    {createtC4Button.length > 0 && (
                      <Tooltip
                        title="Go check"
                        disableInteractive
                        placement="right"
                      >
                        <IconButton
                          onClick={() => {
                            window.location.href =
                              createtC4Button[0].url.replace(
                                "%XXX%",
                                repo[1].abbreviation,
                              );
                          }}
                        >
                          <Tc4ProjectIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {createItemExport?.filter(
                      (item) => item.endpoint === repo[1].flavor,
                    ).length > 0 && (
                      <Tooltip
                        title="Save as..."
                        disableInteractive
                        placement="right"
                      >
                        <IconButton
                          onClick={(event) => {
                            handleSubMenuClick(event);
                            setChooseRepo(repo[0]);
                          }}
                        >
                          <SaveAsOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Menu
                      id="basic-sub-menu"
                      anchorEl={subMenuButtonSave}
                      open={repo[0] === chooseRepo}
                      onClose={() => {
                        setSubMenuButtonSave(null);
                        setChooseRepo(null);
                      }}
                      anchorOrigin={{ vertical: "top", horizontal: "left" }}
                      transformOrigin={{ vertical: "top", horizontal: "right" }}
                      slotProps={{
                        list: { "aria-labelledby": "basic-button" },
                      }}
                    >
                      {createItemExport &&
                        createItemExport
                          .filter((item) => item.endpoint === repo[1].flavor)
                          .map((item) => (
                            <MenuItem
                              key={item.label}
                              onClick={() => (window.location.href = item.url)}
                            >
                              {item.label}
                            </MenuItem>
                          ))}
                    </Menu>

                    {createAboutRepo &&
                      createAboutRepo.some(
                        (item) =>
                          item.category === repo[1].flavor ||
                          item.category === "all",
                      ) && (
                        <Tooltip
                          title="Properties"
                          disableInteractive
                          placement="right"
                        >
                          <IconButton
                            onClick={() => {
                              const item = createAboutRepo.find(
                                (i) =>
                                  i.category === repo[1].flavor ||
                                  i.category === "all",
                              );
                              if (item) {
                                const url = item.url.replace(
                                  chooseRepo,
                                  repo[0],
                                );
                                setChooseRepo(repo[0]);
                                window.location.href = url;
                              }
                            }}
                          >
                            <InfoOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                  </Box>
                </Box>
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
      </Grid2>
    </Box>
  );
}

export default App;
