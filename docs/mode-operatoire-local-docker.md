# Mode Opératoire : Déploiement Local Intégral sous Conteneurs Docker

Ce guide détaille la procédure pas à pas pour déployer et exécuter **l'intégralité** de la plateforme **ResolveIT Helpdesk** sur votre ordinateur local en utilisant exclusivement des conteneurs Docker.

> **Aucune installation de Java, Maven, Node.js ou PostgreSQL n'est requise sur votre machine hôte.** Seul **Docker Engine** (ou **Docker Desktop**) avec le plugin **Docker Compose** est nécessaire.

---

## 1. Topologie des Conteneurs Locaux

Lorsque vous lancez le projet en local, Docker Compose orchestre automatiquement 3 conteneurs isolés sur un réseau privé (`helpdesk-net`) :

```
                                  [ Votre Navigateur Web ]
                                       │              │
                       Port 3000       │              │  Port 8080
                     ┌─────────────────┘              └────────────────┐
                     ▼                                                 ▼
        ┌─────────────────────────┐                       ┌─────────────────────────┐
        │  resolveit-frontend-dev │                       │  resolveit-backend-dev  │
        │  React 19 / Nginx       │ ── Proxy /api/v1/ ──> │  Spring Boot 3.4 JRE 21 │
        │  (Non-root Alpine)      │                       │  (Non-root Alpine)      │
        └─────────────────────────┘                       └─────────────────────────┘
                                                                       │
                                                                       │ Port 5432 (interne)
                                                                       ▼
                                                          ┌─────────────────────────┐
                                                          │  resolveit-postgres-dev │
                                                          │  PostgreSQL 16 Alpine   │
                                                          │  (Volume: pg_data_dev)  │
                                                          └─────────────────────────┘
```

1. **`resolveit-postgres-dev`** : Moteur relationnel PostgreSQL 16 Alpine avec volume persistant `pg_data_dev` et vérification de santé (`pg_isready`).
2. **`resolveit-backend-dev`** : Monolithe modulaire Spring Boot 3.4 (Java 21 LTS). Il attend que PostgreSQL soit en état `healthy`, puis applique automatiquement les migrations Flyway (`V1__initial_schema.sql` et `V2__seed_data.sql`).
3. **`resolveit-frontend-dev`** : Application React 19 + TypeScript compilée en multi-stage build et servie par un serveur web Nginx non-privilégié avec reverse proxy configuré.

---

## 2. Prérequis sur votre Machine

* **Système d'exploitation** : Linux, macOS ou Windows (avec WSL2).
* **Logiciel requis** :
  * **Docker Desktop** (version 24 ou supérieure) **OU** **Docker Engine** avec le plugin **Docker Compose v2** (`docker compose version`).
  * Terminal Bash / Zsh ou PowerShell.
  * Outil `make` (optionnel mais recommandé pour utiliser les raccourcis du `Makefile`).

---

## 3. Procédure de Déploiement Pas à Pas

### Étape 1 : Se positionner dans le répertoire du projet
Ouvrez votre terminal et placez-vous à la racine du projet :
```bash
cd it-helpdesk
```

### Étape 2 : Initialiser le fichier des variables d'environnement
Copiez le modèle `.env.example` pour créer votre fichier `.env` local :
```bash
cp .env.example .env
```
*(Les valeurs par défaut contenues dans `.env.example` sont directement exploitables en local sans modification requise).*

### Étape 3 : Lancer la construction et le démarrage des conteneurs

#### Option A — Via le Makefile (Recommandé) :
```bash
make up
```
*(ou `make build` si vous souhaitez forcer la recompilation des images).*

#### Option B — Directement avec Docker Compose :
```bash
docker compose up -d --build
```

> **Que se passe-t-il pendant cette commande ?**
> 1. Docker télécharge l'image légère `postgres:16-alpine`.
> 2. Le conteneur PostgreSQL démarre et s'initialise.
> 3. L'image backend est construite en multi-stage build (téléchargement des dépendances Maven puis compilation Java 21).
> 4. Dès que PostgreSQL est déclaré `healthy`, le backend démarre et exécute automatiquement les migrations Flyway pour créer les tables et injecter les données de test.
> 5. L'image frontend est construite en multi-stage build (installation npm puis compilation Vite) et Nginx démarre.

---

## 4. Vérification du Déploiement

### Vérifier l'état de santé des conteneurs
Exécutez :
```bash
docker compose ps
```
Vous devez obtenir une sortie similaire à :
```
NAME                     IMAGE                      STATUS                   PORTS
resolveit-postgres-dev   postgres:16-alpine         Up (healthy)             0.0.0.0:5432->5432/tcp
resolveit-backend-dev    resolveit-backend-dev      Up (healthy)             0.0.0.0:8080->8080/tcp
resolveit-frontend-dev   resolveit-frontend-dev     Up (healthy)             0.0.0.0:3000->8080/tcp
```

### Consulter les journaux en direct (Live Logs)
Pour suivre les logs de tous les conteneurs ou diagnostiquer un problème :
```bash
# Tous les services
make logs
# ou
docker compose logs -f

# Un service spécifique
docker compose logs -f backend
docker compose logs -f postgres
```

### Vérifier le point de sonde de santé Spring Boot Actuator
```bash
curl -i http://localhost:8080/actuator/health
```
Réponse attendue :
```json
{"status":"UP"}
```

---

## 5. Accès aux Interfaces & Services

Une fois les conteneurs démarrés :

| Interface / Service | URL Locale | Description |
|---|---|---|
| **Application Web (Frontend React)** | **`http://localhost:3000`** | Interface utilisateur Helpdesk complète avec sélecteur de rôles |
| **API REST Backend** | **`http://localhost:8080/api/v1`** | Points d'entrée REST sécurisés par JWT |
| **Documentation Swagger UI** | **`http://localhost:8080/swagger-ui.html`** | Console interactive OpenAPI 3 pour tester tous les endpoints |
| **Spécification OpenAPI (JSON)** | **`http://localhost:8080/v3/api-docs`** | Contrat d'interface OpenAPI 3 |
| **Sonde de santé Actuator** | **`http://localhost:8080/actuator/health`** | Vérification liveness/readiness |

---

## 6. Comptes de Test Pré-injectés (Flyway Seed)

La migration Flyway `V2__seed_data.sql` injecte automatiquement des comptes de test avec mot de passe haché en **BCrypt** (12 rounds) :

| Rôle | Adresse Email | Mot de passe | Périmètre de droits |
|---|---|---|---|
| **Administrateur** | `admin@resolveit.internal` | `Password123!` | Provisioning comptes, désactivation, journaux d'audit de sécurité |
| **IT Manager** | `manager.sarah@resolveit.internal` | `Password123!` | Surveillance des files, indicateurs de conformité SLA, MTTR |
| **IT Agent (Senior)** | `agent.marcus@resolveit.internal` | `Password123!` | Triage, prise en charge, notes internes confidentielles, résolution |
| **IT Agent (Desk)** | `agent.elena@resolveit.internal` | `Password123!` | Support de premier niveau, commentaires clients, clôture |
| **Employé** | `employee.alex@resolveit.internal` | `Password123!` | Portail self-service, création de tickets, consultation de **ses** tickets |
| **Employée** | `employee.chloe@resolveit.internal` | `Password123!` | Portail self-service, consultation de ses équipements affectés |

*(Vous pouvez basculer instantanément d'un profil à l'autre en cliquant sur le sélecteur de rôle en haut à droite de l'interface web pour tester les règles RBAC et le blocage IDOR).*

---

## 7. Commandes d'Exploitation & Maintenance

Le fichier `Makefile` à la racine fournit des commandes d'exploitation simplifiées :

### Arrêter l'environnement
```bash
make down
# ou
docker compose down
```

### Reconstruire les conteneurs après modification du code
```bash
make build && make up
# ou
docker compose up -d --build
```

### Sauvegarder la base de données PostgreSQL (Dump compressé gzip)
```bash
make db-backup
```
*Le script exporte un fichier compressé `backups/resolveit_backup_YYYYMMDD_HHMMSS.sql.gz` directement depuis le conteneur.*

### Restaurer la base de données depuis la dernière sauvegarde
```bash
make db-restore
```

### Réinitialiser complètement la base et les volumes (Remise à zéro)
```bash
docker compose down -v
docker compose up -d --build
```

---

## 8. Dépannage des Problèmes Fréquents (Troubleshooting)

### Conflit de port (Port already allocated)
* **Erreur** : `Bind for 0.0.0.0:3000 failed: port is already allocated` ou `0.0.0.0:5432 failed`.
* **Solution** : Vous avez un autre service (PostgreSQL local, autre serveur Node/Vite) qui utilise déjà le port.
  * Modifiez les ports hôtes dans le fichier `.env` ou `compose.yaml` (ex: mapper le frontend sur `"3001:8080"` ou Postgres sur `"5433:5432"`).

### Le backend attend indéfiniment PostgreSQL
* **Erreur** : `Waiting for postgres to become healthy...`
* **Vérification** : Inspectez les logs de PostgreSQL via `docker compose logs postgres`. Le conteneur s'assure que le healthcheck `pg_isready` répond avant de lancer Spring Boot.

### Mémoire Docker insuffisante
* **Conseil** : Pour assurer une compilation fluide du build multi-stage Maven (Java 21) et Node.js, assurez-vous d'allouer au moins **4 Go de RAM** à Docker Desktop dans ses paramètres (*Settings > Resources > Memory*).
