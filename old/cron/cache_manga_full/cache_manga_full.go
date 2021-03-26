package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"strconv"
	"sync"
)

func worker(wg *sync.WaitGroup, gap int, limit int) {
	defer wg.Done()

	out, err := exec.Command(
		"./cron/cache_manga_full.rb",
		os.Args[1],
		strconv.Itoa(gap),
		strconv.Itoa(limit),
	).Output()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("%s", out)
}

func main() {
	fmt.Printf("%s\n", os.Args[0])
	var wg sync.WaitGroup
	// var maxThreads int = 1
	var limit int = 0

	if len(os.Args) > 2 {
		// maxThreads, _ = strconv.Atoi(os.Args[2])
	}
	if len(os.Args) > 3 {
		limit, _ = strconv.Atoi(os.Args[3])
	}

	out, err := exec.Command(
		"./cron/n_count_partial.rb",
		os.Args[1],
	).Output()
	if err != nil {
		log.Fatal(err)
	}

	manga_count, _ := strconv.Atoi(fmt.Sprintf("%s", out))
	for i := 0; i < manga_count; i += limit {
		wg.Add(1)
		go worker(&wg, i, limit)
	}

	wg.Wait()
	os.Exit(0)
}
