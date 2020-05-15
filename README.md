# GDPR Data Protection Impact Assessment Tool

## About
A free web-based Data Protection Impact Assessment Tool to assist organisations to evaluate data protection risks with respect to the EU's General Data Protection Regulation (GDPR). The questions used within this tool were originally produced by the A4Cloud project, the original questionnaire is available [here](Data%20Protection%20Impact%20Assessment.pdf).

An instance of the tool is hosted on [GitHub Pages](https://simonarnell.github.io/GDPRDPIAT/) for preview. Please note, to demonstrate how one might use this project for self-service data protection impact assessments within a DevOps team, this project uses the [Staticman](https://staticman.net) project, a useful tool for static sites such as GitHub pages that allows user generated content, in our case GDPR DPIAs, to be committed into a GitHub repository, for this project the submissions are committed on a branch called [staticman](https://github.com/simonarnell/GDPRDPIAT/tree/staticman). The data protection impact assessments could then be used within a GitOps workflow to allow a security expert within the wider DevSecOps team to provide more in-depth analysis and a set of recommendations for a project or sprint.

The submitted DPIAs can be reviewed on the [results](https://simonarnell.github.io/GDPRDPIAT/results.html) page. This queries the GitHub API for the contents of the staticman branch of this repository, the DPIAs are then collated and charts dynamically generated for analysis.

## Disclaimer

Please use this only for what it is intended, a first pass assessment, seek separate legal and privacy advice for a more formal assessment of your organisation’s position. **I accept no liability.**
