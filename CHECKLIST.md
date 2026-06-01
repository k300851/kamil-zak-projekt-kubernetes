## Wymagania
- Docker
- Kubernetes
- kubectl
- Make

## Uruchomienie
```bash
make init
```
lub
```bash
docker build -t api:1.0 .\app\api
docker build -t frontend:1.0 .\app\frontend
docker build -t worker:1.0 .\app\worker

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
kubectl apply -k .\k8s\overlays\dev\
kubectl apply -k .\k8s\overlays\prod\
```

## Zasoby Kubernetes


- Namespace
- Deployment
- StatefulSet
- Service
- Ingress
- ConfigMap
- Secret
- PersistentVolumeClaim
- NetworkPolicy
- PodDisruptionBudget
- Job

## Udany workflow GitHub Actions
```
https://github.com/k300851/kamil-zak-projekt-kubernetes/actions/runs/26777480470
```

## Komendy kubectl oraz curl
```bash
kubectl get namespaces
kubectl get namespace -n ticket-app-prod
kubectl get deployments -n ticket-app-prod 
kubectl get statefulset -n ticket-app-prod
kubectl get ingress -n ticket-app-prod  
kubectl get service -n ticket-app-prod
kubectl get configmap -n ticket-app-prod
kubectl get secret -n ticket-app-prod   
kubectl get pvc -n ticket-app-prod

kubectl get deploy -n ticket-app-prod
kubectl rollout status deployment/api-prod -n ticket-app-prod
kubectl rollout status deployment/frontend-prod -n ticket-app-prod
kubectl rollout status deployment/worker-prod -n ticket-app-prod  
kubectl get pods -n ticket-app-prod  

kubectl describe pod postgres-prod-0 -n ticket-app-prod
kubectl describe statefulset -n ticket-app-prod  
kubectl get statefulset -n ticket-app-prod
kubectl get pvc -n ticket-app-prod
kubectl describe pvc postgres-data-postgres-prod-0 -n ticket-app-prod

kubectl get svc -n ticket-app-prod  
kubectl describe ingress -n ticket-app-prod

kubectl get configmap -n ticket-app-prod   
kubectl describe configmap worker-config-prod -n ticket-app-pro
kubectl get secret -n ticket-app-prod     
kubectl describe secret worker-secret-prod -n ticket-app-prod
kubectl get deployment api-prod -n ticket-app-prod -o yaml

kubectl get deployment api-prod -n ticket-app-prod -o yaml
kubectl get deployment worker-prod -n ticket-app-prod -o yaml
kubectl get deployment frontend-prod -n ticket-app-prod -o yaml
kubectl get pod -n ticket-app-prod
kubectl describe pod api-prod-5f8fcfd884-nwvwp -n ticket-app-prod

kubectl describe pod db-migration-prod-99qk9  -n ticket-app-prod
kubectl get job -n ticket-app-prod
kubectl describe job db-migration-prod -n ticket-app-prod
kubectl logs jobs/db-migration-prod -n ticket-app-prod 

kubectl delete job db-migration-prod -n ticket-app-prod
kubectl apply -k .\k8s\overlays\prod\

kubectl get networkpolicy -n ticket-app-prod
kubectl describe networkpolicy postgres-policy-prod   -n ticket-app-prod

kubectl get pdb -n ticket-app-prod
kubectl describe pdb api-pdb-prod   -n ticket-app-prod

curl http://localhost/api/metrics
curl http://localhost/api/health 
curl http://localhost/api/ready  
curl http://localhost/api/tickets
curl -X POST http://localhost/api/tickets -H "Content-Type: application/json" -d "{\"email\": \"test@wp.pl\", \"description\": \"OK\" }"
```

## Dowód działania workera
```bash
> kubectl get pods -n ticket-app-prod
NAME                            READY   STATUS      RESTARTS   AGE
api-prod-8688cf597c-4k559       1/1     Running     0          28s
api-prod-8688cf597c-bq8pq       1/1     Running     0          37s
db-migration-prod-6nqwl         0/1     Completed   0          10m
frontend-prod-bdcc7d78b-hp92f   1/1     Running     0          37s
postgres-prod-0                 1/1     Running     0          10m
redis-prod-5947f994dc-pttvb     1/1     Running     0          10m
worker-prod-6489cdb5bc-rdxgt    1/1     Running     0          37s
worker-prod-6489cdb5bc-stjdd    1/1     Running     0          26s
> kubectl get svc -n ticket-app-prod
NAME            TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
api-prod        ClusterIP   10.106.234.61    <none>        8080/TCP   11m
frontend-prod   ClusterIP   10.104.227.208   <none>        80/TCP     11m
postgres-prod   ClusterIP   None             <none>        5432/TCP   11m
redis-prod      ClusterIP   10.101.238.252   <none>        6379/TCP   11m
worker-prod     ClusterIP   10.111.50.243    <none>        8081/TCP   11m
> kubectl logs deployment/worker-prod -n ticket-app-prod
Found 2 pods, using pod/worker-prod-6489cdb5bc-rdxgt
> start
> node src/worker.js
Redis connected!
worker works
Send email to:  { description: 'test', email: 'test@gmail.com' }
xxxxx@gmail.com
```


# Wymagania wspólne (dla wszystkich projektów)
## Wymagania architektoniczne — Kubernetes i CI/CD

## Manifesty Kubernetes
- [x] Projekt zawiera katalog k8s/ albo Helm/Kustomize. Manifesty obejmują minimum: Namespace, Deployment, StatefulSet lub równoważny zasób dla bazy, Service, Ingress, ConfigMap, Secret, PVC.

## Deploymenty i rolling update
- [x] Frontend/API/worker działają jako Deployment. Backend ma minimum 2 repliki i strategię aktualizacji rolling update. Sprawdzenie: kubectl get deploy i kubectl rollout status.

## Baza danych i trwałość w Kubernetes
- [x] Baza danych działa jako StatefulSet albo przez jasno uzasadniony zasób zapewniający trwałość. Musi używać PersistentVolumeClaim.

## Services, Ingress i izolacja
- [x] Komunikacja wewnętrzna odbywa się przez Service. Ruch zewnętrzny przechodzi przez Ingress. Baza danych, cache i worker nie są wystawione na zewnątrz klastra.

## ConfigMap i Secret
- [x] Konfiguracja niepoufna jest w ConfigMap, a dane poufne w Secret. Hasła i tokeny nie mogą być zapisane jawnie w kodzie aplikacji ani w README jako prawdziwe wartości produkcyjne.

## Probes i zasoby
- [x] Główne kontenery mają readinessProbe i livenessProbe oraz ustawione resources.requests i resources.limits. Sprawdzenie: szybka analiza manifestów i kubectl describe pod.

## SecurityContext oraz initContainer albo Job
- [x] Kontenery aplikacyjne działają jako non-root i mają podstawowy securityContext. Projekt używa initContainer albo Job do migracji bazy, inicjalizacji danych lub oczekiwania na zależności.

## CI/CD GitHub Actions
- [x] Repozytorium zawiera workflow, który buduje obraz, uruchamia testy lub podstawową walidację, publikuje obraz do rejestru i wykonuje deploy przez kubectl, Helm albo Kustomize. Workflow sprawdza rollout po wdrożeniu.

## Rzeczy dodatkowe spoza zajęć

## NetworkPolicy
- [x] Projekt definiuje NetworkPolicy, które ograniczają ruch między podami, np. baza przyjmuje ruch tylko z backendu lub workera.

## PodDisruptionBudget
- [x] Dla backendu dodano PodDisruptionBudget, który chroni minimalną dostępność replik podczas aktualizacji lub prac utrzymaniowych klastra.

## Helm albo Kustomize
- [x] Projekt używa Helm albo Kustomize do parametryzacji manifestów i obsługuje minimum dwa środowiska, np. dev i prod.

## Obserwowalność
- [x] Aplikacja udostępnia /metrics, adnotacje dla Prometheusa albo inną prostą formę obserwowalności oraz instrukcję sprawdzenia metryk/logów.

# Wymagania specyficzne dla tego projektu
## Minimalna funkcjonalność aplikacji
- [x] Aplikacja ma jeden główny zasób biznesowy i obsługuje co najmniej dodanie danych, odczyt danych oraz endpoint /health lub /ready. Sprawdzenie: 2-3 komendy curl po wdrożeniu.

## Trwałość danych aplikacji
- [x] Dane aplikacji są zapisywane w bazie danych działającej w Kubernetes i pozostają dostępne po restarcie poda bazy. Sprawdzenie: dodać rekord, usunąć pod bazy, odczytać rekord po odtworzeniu poda.

## Cache, kolejka albo worker
- [x] Projekt zawiera dodatkowy komponent architektury, np. Redis, RabbitMQ albo worker. Musi być prosty dowód działania w CHECKLIST.md.

