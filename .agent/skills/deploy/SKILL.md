---
name: deploy
description: Deploy new version to production via GitOps (GitHub Actions + ArgoCD)
---

# 🚀 Deploy to Production

This skill guides the deployment process for Barak Web App using the GitOps workflow.

## Prerequisites

- All changes committed and pushed to `main` branch
- Local build passes: `npm run build`
- No ESLint errors: `npm run lint`

## Deployment Steps

### 1. Verify Build Locally
```bash
npm run build
```
Ensure no errors. Check the `dist/` folder is generated.

### 2. Determine Version Number
Follow semantic versioning (MAJOR.MINOR.PATCH):
- **PATCH** (1.5.0 → 1.5.1): Bug fixes, small tweaks
- **MINOR** (1.5.0 → 1.6.0): New features, non-breaking changes
- **MAJOR** (1.5.0 → 2.0.0): Breaking changes, major redesigns

Check current version:
```bash
# PowerShell (Windows)
git tag --sort=-v:refname | Select-Object -First 5

# Bash/Linux
git tag --sort=-v:refname | head -5
```

### 3. Create and Push Version Tag
```bash
git tag v1.X.X
git push origin v1.X.X
```

### 4. Monitor CI/CD Pipeline
- Go to: https://github.com/doleval013/Barak-web/actions
- Watch the "Docker Image CI/CD" workflow
- Verify both frontend and backend images are built and pushed

### 5. Wait for ArgoCD Sync
The CI pipeline automatically updates `Barak-web-Infra/k8s/app.yaml` with new image tags.
ArgoCD will detect the change and sync automatically (selfHeal: true).

### 6. Verify Deployment
```bash
# Check pods are running (requires kubectl access)
kubectl get pods -l app=barak-web
kubectl get pods -l app=barak-web-backend

# Check the live site
curl -I https://dogs.barakaloni.com
```

### 7. Verify in Admin Dashboard
- Go to: https://dogs.barakaloni.com/admin
- Check the version info in the dashboard matches the deployed version

## Rollback (If Needed)

If something goes wrong:

1. **Quick Rollback** - Update image tag in infra repo:
   ```bash
   cd ../Barak-web-Infra
   # Edit k8s/app.yaml to previous version
   git commit -am "Rollback to v1.X.X"
   git push
   ```

2. **ArgoCD will auto-sync** to the previous version

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CI failed | Check GitHub Actions logs for errors |
| Pods not starting | `kubectl describe pod <pod-name>` |
| ArgoCD not syncing | Check ArgoCD UI or `argocd app get barak-web` |
| Site not loading | Check ingress: `kubectl get ingress` |
