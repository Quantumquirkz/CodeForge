.PHONY: all clean data paper notebook

# Default: generate data, compile paper
all: data paper

# Generate simulation data
data:
	python3 src/mv4e2_simulation.py

# Compile LaTeX proposal
paper: data
	cd proposal && pdflatex -interaction=nonstopmode proposal.tex && pdflatex -interaction=nonstopmode proposal.tex

# Launch Jupyter notebook
notebook:
	jupyter notebook src/mv4e2_notebook.ipynb

# Clean generated files
clean:
	rm -f proposal/*.aux proposal/*.log proposal/*.out proposal/*.bbl proposal/*.blg
	rm -f proposal/*.fdb_latexmk proposal/*.fls proposal/*.synctex.gz proposal/*.toc
	rm -f data/*.csv data/*.json
	rm -rf proposal/figures/*.png proposal/figures/*.pdf
